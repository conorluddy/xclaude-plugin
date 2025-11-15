#!/usr/bin/env node
/**
 * XC-All MCP Server
 *
 * Full toolkit for human+AI collaboration
 * All 23 tools available for maximum flexibility
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// Import ALL tools
// Xcode
import { xcodeBuild, xcodeBuildDefinition, } from "../../shared/tools/xcode/build.js";
import { buildAndRun, xcodeBuildAndRunDefinition, } from "../../shared/tools/xcode/build-and-run.js";
import { xcodeClean, xcodeCleanDefinition, } from "../../shared/tools/xcode/clean.js";
import { xcodeTest, xcodeTestDefinition, } from "../../shared/tools/xcode/test.js";
import { xcodeList, xcodeListDefinition, } from "../../shared/tools/xcode/list.js";
import { xcodeVersion, xcodeVersionDefinition, } from "../../shared/tools/xcode/version.js";
// Simulator
import { simulatorList, simulatorListDefinition, } from "../../shared/tools/simulator/list.js";
import { simulatorBoot, simulatorBootDefinition, } from "../../shared/tools/simulator/boot.js";
import { simulatorShutdown, simulatorShutdownDefinition, } from "../../shared/tools/simulator/shutdown.js";
import { simulatorCreate, simulatorCreateDefinition, } from "../../shared/tools/simulator/create.js";
import { simulatorDelete, simulatorDeleteDefinition, } from "../../shared/tools/simulator/delete.js";
import { simulatorInstallApp, simulatorInstallAppDefinition, } from "../../shared/tools/simulator/install-app.js";
import { simulatorLaunchApp, simulatorLaunchAppDefinition, } from "../../shared/tools/simulator/launch-app.js";
import { simulatorTerminateApp, simulatorTerminateAppDefinition, } from "../../shared/tools/simulator/terminate-app.js";
import { simulatorScreenshot, simulatorScreenshotDefinition, } from "../../shared/tools/simulator/screenshot.js";
import { simulatorOpenURL, simulatorOpenURLDefinition, } from "../../shared/tools/simulator/openurl.js";
import { simulatorGetAppContainer, simulatorGetAppContainerDefinition, } from "../../shared/tools/simulator/get-app-container.js";
import { simulatorHealthCheck, simulatorHealthCheckDefinition, } from "../../shared/tools/simulator/health-check.js";
// IDB
import { idbDescribe, idbDescribeDefinition, } from "../../shared/tools/idb/describe.js";
import { idbTap, idbTapDefinition } from "../../shared/tools/idb/tap.js";
import { idbInput, idbInputDefinition } from "../../shared/tools/idb/input.js";
import { idbGesture, idbGestureDefinition, } from "../../shared/tools/idb/gesture.js";
import { idbFindElement, idbFindElementDefinition, } from "../../shared/tools/idb/find-element.js";
import { idbCheckQuality, idbCheckQualityDefinition, } from "../../shared/tools/idb/check-quality.js";
class XCAllServer {
    server;
    constructor() {
        this.server = new Server({
            name: "xc-all",
            version: "0.3.0",
            title: "Complete Toolkit",
            description: "Full iOS development toolkit for human+AI collaboration - all 23 tools",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.registerTools();
    }
    registerTools() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                // Xcode (6 tools)
                xcodeBuildDefinition,
                xcodeBuildAndRunDefinition,
                xcodeCleanDefinition,
                xcodeTestDefinition,
                xcodeListDefinition,
                xcodeVersionDefinition,
                // Simulator (12 tools)
                simulatorListDefinition,
                simulatorBootDefinition,
                simulatorShutdownDefinition,
                simulatorCreateDefinition,
                simulatorDeleteDefinition,
                simulatorInstallAppDefinition,
                simulatorLaunchAppDefinition,
                simulatorTerminateAppDefinition,
                simulatorScreenshotDefinition,
                simulatorOpenURLDefinition,
                simulatorGetAppContainerDefinition,
                simulatorHealthCheckDefinition,
                // IDB (6 tools)
                idbDescribeDefinition,
                idbTapDefinition,
                idbInputDefinition,
                idbGestureDefinition,
                idbFindElementDefinition,
                idbCheckQualityDefinition,
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                // Xcode
                case "xcode_build":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await xcodeBuild(args)),
                            },
                        ],
                    };
                case "xcode_build_and_run":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await buildAndRun(args)),
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
                case "xcode_test":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await xcodeTest(args)),
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
                case "xcode_version":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await xcodeVersion(args)),
                            },
                        ],
                    };
                // Simulator
                case "simulator_list":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorList(args)),
                            },
                        ],
                    };
                case "simulator_boot":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorBoot(args)),
                            },
                        ],
                    };
                case "simulator_shutdown":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorShutdown(args)),
                            },
                        ],
                    };
                case "simulator_create":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorCreate(args)),
                            },
                        ],
                    };
                case "simulator_delete":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorDelete(args)),
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
                case "simulator_terminate_app":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorTerminateApp(args)),
                            },
                        ],
                    };
                case "simulator_screenshot":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorScreenshot(args)),
                            },
                        ],
                    };
                case "simulator_openurl":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorOpenURL(args)),
                            },
                        ],
                    };
                case "simulator_get_app_container":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorGetAppContainer(args)),
                            },
                        ],
                    };
                case "simulator_health_check":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorHealthCheck(args)),
                            },
                        ],
                    };
                // IDB
                case "idb_describe":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbDescribe(args)),
                            },
                        ],
                    };
                case "idb_tap":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbTap(args)),
                            },
                        ],
                    };
                case "idb_input":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbInput(args)),
                            },
                        ],
                    };
                case "idb_gesture":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbGesture(args)),
                            },
                        ],
                    };
                case "idb_find_element":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbFindElement(args)),
                            },
                        ],
                    };
                case "idb_check_quality":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbCheckQuality(args)),
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
        console.error("xc-all MCP server running");
    }
}
const server = new XCAllServer();
server.run().catch(console.error);
