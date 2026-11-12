/**
 * logs_show — Read app logs from macOS unified logging
 */

import type { ToolDefinition, ToolResult } from "../../types/base.js";
import type {
  LogsShowParams,
  LogsShowResultData,
  LogEntry,
} from "../../types/logs.js";
import { runCommand } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
import { LOGS_CONFIG } from "../../utils/constants.js";

export type { LogsShowParams, LogsShowResultData };

export const logsShowDefinition: ToolDefinition = {
  name: "logs_show",
  description:
    "Read recent app console output from macOS unified logging. Provide at least process or subsystem to filter logs.",
  inputSchema: {
    type: "object",
    properties: {
      process: {
        type: "string",
        description: 'Process name to filter (e.g. "MyApp", "SpringBoard")',
      },
      subsystem: {
        type: "string",
        description: 'Subsystem to filter (e.g. "com.apple.UIKit")',
      },
      last_minutes: {
        type: "number",
        description: "How many minutes of logs to retrieve (default: 5)",
      },
      level: {
        type: "string",
        enum: ["default", "info", "debug", "error", "fault"],
        description: "Minimum log level (default: info)",
      },
      max_entries: {
        type: "number",
        description: "Maximum log entries to return (default: 50, max: 200)",
      },
    },
  },
};

export async function logsShow(
  params: LogsShowParams,
): Promise<ToolResult<LogsShowResultData>> {
  try {
    if (!params.process && !params.subsystem) {
      return {
        success: false,
        error: "At least one of 'process' or 'subsystem' must be provided",
        operation: "logs_show",
      };
    }

    const lastMinutes = Math.min(
      params.last_minutes ?? LOGS_CONFIG.DEFAULT_LAST_MINUTES,
      LOGS_CONFIG.MAX_LAST_MINUTES,
    );
    const maxEntries = Math.min(
      params.max_entries ?? LOGS_CONFIG.DEFAULT_MAX_ENTRIES,
      LOGS_CONFIG.MAX_ENTRIES_CEILING,
    );
    const level = params.level ?? LOGS_CONFIG.DEFAULT_LOG_LEVEL;

    // Sanitize inputs to prevent predicate injection —
    // strip quotes and backslashes that could break out of the predicate string literal
    const sanitize = (v: string) => v.replace(/["\\]/g, "");

    // Build predicate
    const predicateParts: string[] = [];
    if (params.process) {
      predicateParts.push(`process == "${sanitize(params.process)}"`);
    }
    if (params.subsystem) {
      predicateParts.push(`subsystem == "${sanitize(params.subsystem)}"`);
    }
    const predicate = predicateParts.join(" AND ");

    // macOS `log show` uses --info and --debug boolean flags (not --level)
    // Default output includes "Default" and "Error/Fault" levels.
    // --info adds "Info" level, --debug adds both "Info" and "Debug" levels.
    const args = [
      "show",
      "--predicate",
      predicate,
      "--last",
      `${lastMinutes}m`,
      "--style",
      "ndjson",
    ];

    if (level === "debug") {
      args.push("--debug");
    } else if (level === "info") {
      args.push("--info");
    }
    // "default", "error", "fault" need no extra flags — they're always included

    logger.info(
      `Reading logs: predicate='${predicate}', last=${lastMinutes}m, level=${level}`,
    );

    const result = await runCommand("log", args, {
      timeout: LOGS_CONFIG.LOG_COMMAND_TIMEOUT_MS,
    });

    // Parse NDJSON output
    const entries: LogEntry[] = [];
    const lines = result.stdout.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        entries.push({
          timestamp: parsed.timestamp || "",
          process:
            parsed.processImagePath?.split("/").pop() || parsed.process || "",
          subsystem: parsed.subsystem || undefined,
          category: parsed.category || undefined,
          level: parsed.messageType || "info",
          message: parsed.eventMessage || "",
        });
      } catch {
        // Skip malformed lines
      }
    }

    const truncated = entries.length > maxEntries;
    const cappedEntries = entries.slice(0, maxEntries);

    const timeRange = `last ${lastMinutes} minute${lastMinutes !== 1 ? "s" : ""}`;

    const data: LogsShowResultData = {
      entries: cappedEntries,
      count: cappedEntries.length,
      truncated,
      time_range: timeRange,
      message: `Found ${cappedEntries.length} log entries${truncated ? ` (truncated from ${entries.length})` : ""} from ${timeRange}`,
    };

    return {
      success: true as const,
      data,
      summary: `${cappedEntries.length} log entries`,
    };
  } catch (error) {
    logger.error("Failed to read logs", error as Error);
    return { success: false, error: String(error), operation: "logs_show" };
  }
}
