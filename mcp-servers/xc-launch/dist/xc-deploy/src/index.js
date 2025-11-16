#!/usr/bin/env node
/**
 * XC-Deploy MCP Server
 *
 * Composable primitives for iOS deployment workflow
 * Provides: build, install, launch as independent operations
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// Import tool definitions and implementations
import { xcodeBuild, xcodeBuildDefinition, } from "../../shared/tools/xcode/build.js";
import { xcodeClean, xcodeCleanDefinition, } from "../../shared/tools/xcode/clean.js";
import { xcodeList, xcodeListDefinition, } from "../../shared/tools/xcode/list.js";
import { simulatorInstallApp, simulatorInstallAppDefinition, } from "../../shared/tools/simulator/install-app.js";
import { simulatorLaunchApp, simulatorLaunchAppDefinition, } from "../../shared/tools/simulator/launch-app.js";
class XCDeployServer {
    server;
    constructor() {
        this.server = new Server({
            name: "xc-deploy",
            version: "0.4.0",
            title: "Deploy Toolkit",
            description: "Composable iOS deployment primitives: build, install, launch as independent operations.",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.registerTools();
    }
    registerTools() {
        // List tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                xcodeBuildDefinition,
                simulatorInstallAppDefinition,
                simulatorLaunchAppDefinition,
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
                                text: JSON.stringify(await xcodeBuild(args)),
                            },
                        ],
                    };
                case "simulator_install_app":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorInstallApp(args)),
                            },
                        ],
                    };
                case "simulator_launch_app":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorLaunchApp(args)),
                            },
                        ],
                    };
                case "xcode_clean":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await xcodeClean(args)),
                            },
                        ],
                    };
                case "xcode_list":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await xcodeList(args)),
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
        console.error("xc-deploy MCP server running");
    }
}
const server = new XCDeployServer();
server.run().catch(console.error);
