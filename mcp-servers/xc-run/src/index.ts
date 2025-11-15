#!/usr/bin/env node
/**
 * XC-Run MCP Server
 *
 * Rapid development MCP - build, install, and launch iOS apps
 * Combines build, install, and launch for streamlined development workflow
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import tool definitions and implementations
import {
  xcodeBuild,
  xcodeBuildDefinition,
} from "../../shared/tools/xcode/build.js";
import {
  xcodeClean,
  xcodeCleanDefinition,
} from "../../shared/tools/xcode/clean.js";
import {
  xcodeList,
  xcodeListDefinition,
} from "../../shared/tools/xcode/list.js";
import {
  buildAndRun,
  xcodeBuildAndRunDefinition,
} from "../../shared/tools/xcode/build-and-run.js";

class XCRunServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "xc-run",
        version: "0.3.0",
        title: "Rapid Development",
        description:
          "Rapid development MCP for iOS projects - build, build+run, clean, and list. Perfect for iterative development.",
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
        xcodeBuildDefinition,
        xcodeBuildAndRunDefinition,
        xcodeCleanDefinition,
        xcodeListDefinition,
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "xcode_build":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await xcodeBuild(
                    args as unknown as Parameters<typeof xcodeBuild>[0],
                  ),
                ),
              },
            ],
          };

        case "xcode_build_and_run":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await buildAndRun(
                    args as unknown as Parameters<typeof buildAndRun>[0],
                  ),
                ),
              },
            ],
          };

        case "xcode_clean":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await xcodeClean(
                    args as unknown as Parameters<typeof xcodeClean>[0],
                  ),
                ),
              },
            ],
          };

        case "xcode_list":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await xcodeList(
                    args as unknown as Parameters<typeof xcodeList>[0],
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
    console.error("xc-run MCP server running");
  }
}

const server = new XCRunServer();
server.run().catch(console.error);
