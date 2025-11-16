#!/usr/bin/env node
/**
 * XC-Launch MCP Server
 *
 * Simulator app lifecycle operations
 * Provides: install, launch primitives for rapid development
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import tool definitions and implementations
import {
  simulatorInstallApp,
  simulatorInstallAppDefinition,
} from "../../shared/tools/simulator/install-app.js";
import {
  simulatorLaunchApp,
  simulatorLaunchAppDefinition,
} from "../../shared/tools/simulator/launch-app.js";

class XCLaunchServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "xc-launch",
        version: "0.4.0",
        title: "Launch Toolkit",
        description:
          "Simulator app lifecycle: install and launch operations for rapid development.",
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
      tools: [simulatorInstallAppDefinition, simulatorLaunchAppDefinition],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "simulator_install_app":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorInstallApp(
                    args as unknown as Parameters<
                      typeof simulatorInstallApp
                    >[0],
                  ),
                ),
              },
            ],
          };

        case "simulator_launch_app":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorLaunchApp(
                    args as unknown as Parameters<typeof simulatorLaunchApp>[0],
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
    console.error("xc-launch MCP server running");
  }
}

const server = new XCLaunchServer();
server.run().catch(console.error);
