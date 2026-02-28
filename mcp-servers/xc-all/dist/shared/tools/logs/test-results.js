/**
 * logs_test_results — Parse test results from xcresult bundles
 */
import { stat } from "fs/promises";
import { resolve } from "path";
import { homedir } from "os";
import { runCommand } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
import { LOGS_CONFIG } from "../../utils/constants.js";
import { findLatestXcresult } from "./derived-data.js";
export const logsTestResultsDefinition = {
    name: "logs_test_results",
    description: "Parse test pass/fail results from an xcresult bundle. Shows counts and details for failed tests. Auto-discovers the latest xcresult if no path is provided.",
    inputSchema: {
        type: "object",
        properties: {
            xcresult_path: {
                type: "string",
                description: "Explicit path to .xcresult bundle (auto-discovered if omitted)",
            },
            project_path: {
                type: "string",
                description: "Path to .xcodeproj/.xcworkspace to narrow auto-discovery",
            },
        },
    },
};
export async function logsTestResults(params) {
    try {
        // Find xcresult
        const xcresultPath = params.xcresult_path || (await findLatestXcresult(params.project_path));
        if (!xcresultPath) {
            return {
                success: false,
                error: "No .xcresult bundle found. Run tests first or provide an explicit xcresult_path.",
                operation: "logs_test_results",
            };
        }
        if (!xcresultPath.endsWith(".xcresult")) {
            return {
                success: false,
                error: `Path does not end in .xcresult: ${xcresultPath}`,
                operation: "logs_test_results",
            };
        }
        // Validate path is within expected directories (prevent path traversal)
        if (params.xcresult_path) {
            const resolved = resolve(xcresultPath);
            const home = homedir();
            const allowedPrefixes = [
                resolve(home, LOGS_CONFIG.DERIVED_DATA_DIR),
                "/tmp/",
                "/var/folders/",
            ];
            if (!allowedPrefixes.some((prefix) => resolved.startsWith(prefix))) {
                return {
                    success: false,
                    error: "xcresult_path must be within Xcode DerivedData, /tmp/, or /var/folders/",
                    operation: "logs_test_results",
                };
            }
        }
        // Verify path exists
        try {
            await stat(xcresultPath);
        }
        catch {
            return {
                success: false,
                error: `xcresult bundle not found at: ${xcresultPath}`,
                operation: "logs_test_results",
            };
        }
        logger.info(`Parsing test results from: ${xcresultPath}`);
        // Run both commands in parallel
        const [summaryResult, testsResult] = await Promise.all([
            runCommand("xcrun", [
                "xcresulttool",
                "get",
                "test-results",
                "summary",
                "--path",
                xcresultPath,
            ], { timeout: LOGS_CONFIG.XCRESULTTOOL_TIMEOUT_MS }),
            runCommand("xcrun", [
                "xcresulttool",
                "get",
                "test-results",
                "tests",
                "--path",
                xcresultPath,
            ], { timeout: LOGS_CONFIG.XCRESULTTOOL_TIMEOUT_MS }),
        ]);
        if (summaryResult.code !== 0) {
            return {
                success: false,
                error: `xcresulttool summary failed with code ${summaryResult.code}`,
                operation: "logs_test_results",
                details: summaryResult.stderr || summaryResult.stdout,
            };
        }
        // Parse summary
        let summary;
        try {
            summary = JSON.parse(summaryResult.stdout);
        }
        catch {
            return {
                success: false,
                error: "Failed to parse test summary JSON",
                operation: "logs_test_results",
                details: summaryResult.stdout.slice(0, 500),
            };
        }
        const passed = summary.passed ?? summary.passedTests ?? 0;
        const failed = summary.failed ?? summary.failedTests ?? 0;
        const skipped = summary.skipped ?? summary.skippedTests ?? 0;
        const total = passed + failed + skipped;
        const duration = summary.totalDuration ?? summary.duration ?? 0;
        const durationStr = typeof duration === "number"
            ? `${duration.toFixed(1)}s`
            : String(duration);
        // Parse test tree for failures
        const failedTests = [];
        if (testsResult.code === 0 && testsResult.stdout.trim()) {
            try {
                const tests = JSON.parse(testsResult.stdout);
                extractFailedTests(tests, failedTests);
            }
            catch {
                logger.debug("Failed to parse test tree JSON, skipping failure details");
            }
        }
        const data = {
            xcresult_path: xcresultPath,
            passed,
            failed,
            skipped,
            total,
            duration: durationStr,
            failed_tests: failedTests,
            message: failed > 0
                ? `${failed} of ${total} tests failed (${durationStr})`
                : `All ${total} tests passed (${durationStr})`,
        };
        return { success: true, data, summary: data.message };
    }
    catch (error) {
        logger.error("Failed to parse test results", error);
        return {
            success: false,
            error: String(error),
            operation: "logs_test_results",
        };
    }
}
/**
 * Walk the test tree hierarchy and extract failed tests
 */
function extractFailedTests(node, results, suiteName = "") {
    if (!node)
        return;
    // Handle array of nodes
    if (Array.isArray(node)) {
        for (const child of node) {
            extractFailedTests(child, results, suiteName);
        }
        return;
    }
    const currentSuite = node.name || suiteName;
    // Leaf test node
    if (node.status && node.name && !node.children && !node.subtests) {
        if (node.status === "failed" || node.status === "Failure") {
            results.push({
                name: node.name,
                suite: suiteName,
                status: "failed",
                duration_seconds: node.duration,
                failure_message: node.failureMessage || node.message || undefined,
            });
        }
        return;
    }
    // Recurse into children
    const children = node.children || node.subtests || [];
    for (const child of children) {
        extractFailedTests(child, results, currentSuite);
    }
}
