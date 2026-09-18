/**
 * logs_crash_reports — Read and parse crash reports (.ips files)
 */
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { logger } from "../../utils/logger.js";
import { LOGS_CONFIG } from "../../utils/constants.js";
export const logsCrashReportsDefinition = {
    name: "logs_crash_reports",
    description: "Read and parse crash reports (.ips files) with backtraces. Searches macOS DiagnosticReports and optionally simulator crash directories.",
    inputSchema: {
        type: "object",
        properties: {
            app_name: {
                type: "string",
                description: "Filter by app/process name (matches filename and process name)",
            },
            max_reports: {
                type: "number",
                description: "Maximum reports to return (default: 1, max: 5)",
            },
            last_hours: {
                type: "number",
                description: "Only include reports from the last N hours (default: 24)",
            },
            include_simulator: {
                type: "boolean",
                description: "Also search CoreSimulator crash directories (default: false)",
            },
        },
    },
};
export async function logsCrashReports(params) {
    try {
        const maxReports = Math.min(params.max_reports ?? LOGS_CONFIG.DEFAULT_MAX_CRASH_REPORTS, LOGS_CONFIG.MAX_CRASH_REPORTS_CEILING);
        const lastHours = params.last_hours ?? LOGS_CONFIG.DEFAULT_CRASH_HOURS;
        const cutoffTime = Date.now() - lastHours * 60 * 60 * 1000;
        // Build search directories
        const home = homedir();
        const searchDirs = [
            join(home, LOGS_CONFIG.DIAGNOSTIC_REPORTS_DIR),
        ];
        if (params.include_simulator) {
            const coreSimDir = join(home, LOGS_CONFIG.CORE_SIMULATOR_LOGS_DIR);
            try {
                const simEntries = await readdir(coreSimDir, { withFileTypes: true });
                for (const entry of simEntries) {
                    if (entry.isDirectory()) {
                        searchDirs.push(join(coreSimDir, entry.name, "DiagnosticReports"));
                    }
                }
            }
            catch {
                logger.debug("CoreSimulator logs directory not accessible");
            }
        }
        // Collect .ips files from all search dirs
        const ipsFiles = [];
        for (const dir of searchDirs) {
            try {
                const files = await readdir(dir, { withFileTypes: true });
                for (const file of files) {
                    if (!file.name.endsWith(".ips"))
                        continue;
                    // Filter by app name in filename if provided
                    if (params.app_name &&
                        !file.name.toLowerCase().includes(params.app_name.toLowerCase())) {
                        continue;
                    }
                    const fullPath = join(dir, file.name);
                    try {
                        const stats = await stat(fullPath);
                        if (stats.mtimeMs >= cutoffTime) {
                            if (stats.size > LOGS_CONFIG.MAX_IPS_FILE_SIZE_BYTES) {
                                logger.debug(`Skipping oversized crash report: ${fullPath} (${stats.size} bytes)`);
                                continue;
                            }
                            ipsFiles.push({ path: fullPath, mtime: stats.mtimeMs });
                        }
                    }
                    catch {
                        // Skip inaccessible files
                    }
                }
            }
            catch {
                // Directory doesn't exist, skip
            }
        }
        // Sort by recency and take max_reports
        ipsFiles.sort((a, b) => b.mtime - a.mtime);
        const selectedFiles = ipsFiles.slice(0, maxReports);
        // Parse each .ips file
        const reports = [];
        for (const file of selectedFiles) {
            try {
                const content = await readFile(file.path, "utf-8");
                const report = parseIpsFile(content, file.path);
                if (report) {
                    // Additional app_name filter on parsed process name
                    if (params.app_name &&
                        !report.process_name
                            .toLowerCase()
                            .includes(params.app_name.toLowerCase())) {
                        continue;
                    }
                    reports.push(report);
                }
            }
            catch {
                logger.debug(`Failed to parse crash report: ${file.path}`);
            }
        }
        const data = {
            reports,
            count: reports.length,
            search_dirs: searchDirs,
            message: reports.length > 0
                ? `Found ${reports.length} crash report${reports.length !== 1 ? "s" : ""} from the last ${lastHours} hours`
                : `No crash reports found in the last ${lastHours} hours`,
        };
        return { success: true, data, summary: data.message };
    }
    catch (error) {
        logger.error("Failed to read crash reports", error);
        return {
            success: false,
            error: String(error),
            operation: "logs_crash_reports",
        };
    }
}
/**
 * Parse a .ips crash report file (JSON format)
 */
function parseIpsFile(content, filePath) {
    try {
        // .ips files may have a JSON header line followed by a JSON body,
        // or be entirely JSON. Try parsing the whole content first.
        let data;
        try {
            data = JSON.parse(content);
        }
        catch {
            // Some .ips files have a JSON header line then a JSON body.
            // Skip the first line (header) and parse the rest.
            const firstNewline = content.indexOf("\n");
            if (firstNewline >= 0) {
                const body = content.slice(firstNewline + 1).trim();
                if (body) {
                    data = JSON.parse(body);
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
        // Verify this has crash data (not just a header)
        if (!data.procName &&
            !data.threads &&
            !data.faultingThread &&
            data.faultingThread !== 0) {
            return null;
        }
        // Extract crash info
        const processName = data.procName || data.name || data.processName || "unknown";
        const timestamp = data.captureTime || data.timestamp || data.date || "";
        // Exception info
        const exceptionType = data.exception?.type || data.termination?.signal || undefined;
        const exceptionReason = data.exception?.message ||
            data.exception?.subtype ||
            data.termination?.reason ||
            undefined;
        // Faulting thread
        const faultingThread = data.faultingThread ?? data.crashedThreadNumber ?? 0;
        // Extract backtrace for the crashed thread
        const backtrace = [];
        const threads = data.threads || [];
        if (threads.length > faultingThread) {
            const crashedThread = threads[faultingThread];
            const frames = crashedThread.frames || [];
            for (let i = 0; i < Math.min(frames.length, LOGS_CONFIG.MAX_BACKTRACE_FRAMES); i++) {
                const frame = frames[i];
                backtrace.push({
                    frame_number: i,
                    binary: frame.imageOffset !== undefined
                        ? frame.imageName || frame.binaryName || "???"
                        : frame.imageName || frame.binaryName || "???",
                    address: frame.imageOffset !== undefined
                        ? String(frame.imageOffset)
                        : frame.address || "0x0",
                    symbol: frame.symbol || frame.symbolName || undefined,
                });
            }
        }
        return {
            file_path: filePath,
            process_name: processName,
            timestamp,
            exception_type: exceptionType,
            exception_reason: exceptionReason,
            crashed_thread: faultingThread,
            backtrace,
        };
    }
    catch {
        return null;
    }
}
