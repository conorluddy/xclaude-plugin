/**
 * logs_build_diagnostics — Parse build errors/warnings from xcresult bundles
 */

import { stat } from "fs/promises";
import { resolve } from "path";
import { homedir } from "os";
import type { ToolDefinition, ToolResult } from "../../types/base.js";
import type {
  BuildDiagnosticsParams,
  BuildDiagnosticsResultData,
  BuildDiagnosticEntry,
} from "../../types/logs.js";
import { runCommand } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
import { LOGS_CONFIG } from "../../utils/constants.js";
import { findLatestXcresult } from "./derived-data.js";

export type { BuildDiagnosticsParams, BuildDiagnosticsResultData };

export const logsBuildDiagnosticsDefinition: ToolDefinition = {
  name: "logs_build_diagnostics",
  description:
    "Parse structured build errors and warnings from an xcresult bundle. Auto-discovers the latest xcresult if no path is provided.",
  inputSchema: {
    type: "object",
    properties: {
      xcresult_path: {
        type: "string",
        description:
          "Explicit path to .xcresult bundle (auto-discovered if omitted)",
      },
      project_path: {
        type: "string",
        description: "Path to .xcodeproj/.xcworkspace to narrow auto-discovery",
      },
    },
  },
};

export async function logsBuildDiagnostics(
  params: BuildDiagnosticsParams,
): Promise<ToolResult<BuildDiagnosticsResultData>> {
  try {
    // Find xcresult
    const xcresultPath =
      params.xcresult_path || (await findLatestXcresult(params.project_path));

    if (!xcresultPath) {
      return {
        success: false,
        error:
          "No .xcresult bundle found. Build the project first or provide an explicit xcresult_path.",
        operation: "logs_build_diagnostics",
      };
    }

    if (!xcresultPath.endsWith(".xcresult")) {
      return {
        success: false,
        error: `Path does not end in .xcresult: ${xcresultPath}`,
        operation: "logs_build_diagnostics",
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
          error:
            "xcresult_path must be within Xcode DerivedData, /tmp/, or /var/folders/",
          operation: "logs_build_diagnostics",
        };
      }
    }

    // Verify path exists
    try {
      await stat(xcresultPath);
    } catch {
      return {
        success: false,
        error: `xcresult bundle not found at: ${xcresultPath}`,
        operation: "logs_build_diagnostics",
      };
    }

    logger.info(`Parsing build diagnostics from: ${xcresultPath}`);

    const result = await runCommand(
      "xcrun",
      ["xcresulttool", "get", "build-results", "--path", xcresultPath],
      { timeout: LOGS_CONFIG.XCRESULTTOOL_TIMEOUT_MS },
    );

    if (result.code !== 0) {
      return {
        success: false,
        error: `xcresulttool failed with code ${result.code}`,
        operation: "logs_build_diagnostics",
        details: result.stderr || result.stdout,
      };
    }

    // Parse JSON output
    let buildResults: any;
    try {
      buildResults = JSON.parse(result.stdout);
    } catch {
      return {
        success: false,
        error: "Failed to parse xcresulttool JSON output",
        operation: "logs_build_diagnostics",
        details: result.stdout.slice(0, 500),
      };
    }

    // Extract diagnostics
    const errors: BuildDiagnosticEntry[] = [];
    const warnings: BuildDiagnosticEntry[] = [];
    const notes: BuildDiagnosticEntry[] = [];

    const diagnostics = buildResults.diagnostics || [];
    for (const diag of diagnostics) {
      const entry: BuildDiagnosticEntry = {
        type:
          diag.severity === "error"
            ? "error"
            : diag.severity === "warning"
              ? "warning"
              : "note",
        message: diag.message || diag.title || "",
        file: diag.sourceLocation?.path,
        line: diag.sourceLocation?.line,
        column: diag.sourceLocation?.column,
      };

      if (entry.type === "error") {
        errors.push(entry);
      } else if (entry.type === "warning") {
        warnings.push(entry);
      } else {
        notes.push(entry);
      }
    }

    const data: BuildDiagnosticsResultData = {
      xcresult_path: xcresultPath,
      errors,
      warnings,
      counts: {
        errors: errors.length,
        warnings: warnings.length,
        notes: notes.length,
      },
      message:
        errors.length > 0
          ? `Build has ${errors.length} error${errors.length !== 1 ? "s" : ""} and ${warnings.length} warning${warnings.length !== 1 ? "s" : ""}`
          : warnings.length > 0
            ? `Build clean with ${warnings.length} warning${warnings.length !== 1 ? "s" : ""}`
            : "Build clean — no errors or warnings",
    };

    return { success: true as const, data, summary: data.message };
  } catch (error) {
    logger.error("Failed to parse build diagnostics", error as Error);
    return {
      success: false,
      error: String(error),
      operation: "logs_build_diagnostics",
    };
  }
}
