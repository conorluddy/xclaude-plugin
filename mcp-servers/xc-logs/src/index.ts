#!/usr/bin/env node
/**
 * XC-Logs MCP Server
 *
 * Read runtime logs, build diagnostics, test results, and crash reports
 * from macOS unified logging, xcresult bundles, and diagnostic reports
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import tool definitions and implementations
import { logsShow, logsShowDefinition } from "../../shared/tools/logs/show.js";
import {
  logsBuildDiagnostics,
  logsBuildDiagnosticsDefinition,
} from "../../shared/tools/logs/build-diagnostics.js";
import {
  logsTestResults,
  logsTestResultsDefinition,
} from "../../shared/tools/logs/test-results.js";
import {
  logsCrashReports,
  logsCrashReportsDefinition,
} from "../../shared/tools/logs/crash-reports.js";

class XCLogsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "xc-logs",
        version: "0.4.0",
        title: "Logs & Diagnostics",
        description:
          "Read app logs, build diagnostics, test results, and crash reports — 4 tools for runtime debugging.",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.registerTools();
  }

  private registerTools() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        logsShowDefinition,
        logsBuildDiagnosticsDefinition,
        logsTestResultsDefinition,
        logsCrashReportsDefinition,
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "logs_show":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await logsShow(
                    args as unknown as Parameters<typeof logsShow>[0],
                  ),
                ),
              },
            ],
          };

        case "logs_build_diagnostics":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await logsBuildDiagnostics(
                    args as unknown as Parameters<
                      typeof logsBuildDiagnostics
                    >[0],
                  ),
                ),
              },
            ],
          };

        case "logs_test_results":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await logsTestResults(
                    args as unknown as Parameters<typeof logsTestResults>[0],
                  ),
                ),
              },
            ],
          };

        case "logs_crash_reports":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await logsCrashReports(
                    args as unknown as Parameters<typeof logsCrashReports>[0],
                  ),
                ),
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("xc-logs MCP server running");
  }
}

const server = new XCLogsServer();
server.run().catch(console.error);
