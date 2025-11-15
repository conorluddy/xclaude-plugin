#!/usr/bin/env node
/**
 * XC-All MCP Server
 *
 * Full toolkit for human+AI collaboration
 * All 23 tools available for maximum flexibility
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import ALL tools
// Xcode
import {
  xcodeBuild,
  xcodeBuildDefinition,
} from "../../shared/tools/xcode/build.js";
import {
  buildAndLaunch,
  xcodeBuildAndLaunchDefinition,
} from "../../shared/tools/xcode/build-and-launch.js";
import {
  xcodeClean,
  xcodeCleanDefinition,
} from "../../shared/tools/xcode/clean.js";
import {
  xcodeTest,
  xcodeTestDefinition,
} from "../../shared/tools/xcode/test.js";
import {
  xcodeList,
  xcodeListDefinition,
} from "../../shared/tools/xcode/list.js";
import {
  xcodeVersion,
  xcodeVersionDefinition,
} from "../../shared/tools/xcode/version.js";

// Simulator
import {
  simulatorList,
  simulatorListDefinition,
} from "../../shared/tools/simulator/list.js";
import {
  simulatorBoot,
  simulatorBootDefinition,
} from "../../shared/tools/simulator/boot.js";
import {
  simulatorShutdown,
  simulatorShutdownDefinition,
} from "../../shared/tools/simulator/shutdown.js";
import {
  simulatorCreate,
  simulatorCreateDefinition,
} from "../../shared/tools/simulator/create.js";
import {
  simulatorDelete,
  simulatorDeleteDefinition,
} from "../../shared/tools/simulator/delete.js";
import {
  simulatorInstallApp,
  simulatorInstallAppDefinition,
} from "../../shared/tools/simulator/install-app.js";
import {
  simulatorLaunchApp,
  simulatorLaunchAppDefinition,
} from "../../shared/tools/simulator/launch-app.js";
import {
  simulatorTerminateApp,
  simulatorTerminateAppDefinition,
} from "../../shared/tools/simulator/terminate-app.js";
import {
  simulatorScreenshot,
  simulatorScreenshotDefinition,
} from "../../shared/tools/simulator/screenshot.js";
import {
  simulatorOpenURL,
  simulatorOpenURLDefinition,
} from "../../shared/tools/simulator/openurl.js";
import {
  simulatorGetAppContainer,
  simulatorGetAppContainerDefinition,
} from "../../shared/tools/simulator/get-app-container.js";
import {
  simulatorHealthCheck,
  simulatorHealthCheckDefinition,
} from "../../shared/tools/simulator/health-check.js";

// IDB
import {
  idbDescribe,
  idbDescribeDefinition,
} from "../../shared/tools/idb/describe.js";
import { idbTap, idbTapDefinition } from "../../shared/tools/idb/tap.js";
import { idbInput, idbInputDefinition } from "../../shared/tools/idb/input.js";
import {
  idbGesture,
  idbGestureDefinition,
} from "../../shared/tools/idb/gesture.js";
import {
  idbFindElement,
  idbFindElementDefinition,
} from "../../shared/tools/idb/find-element.js";
import {
  idbCheckQuality,
  idbCheckQualityDefinition,
} from "../../shared/tools/idb/check-quality.js";

class XCAllServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "xc-all",
        version: "0.3.0",
        title: "Complete Toolkit",
        description:
          "Full iOS development toolkit for human+AI collaboration - all 23 tools",
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
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Xcode (6 tools)
        xcodeBuildDefinition,
        xcodeBuildAndLaunchDefinition,
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
                text: JSON.stringify(
                  await xcodeBuild(
                    args as unknown as Parameters<typeof xcodeBuild>[0],
                  ),
                ),
              },
            ],
          };
        case "xcode_build_and_launch":
        case "xcode_build_and_run": // Backward compatibility
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await buildAndLaunch(
                    args as unknown as Parameters<typeof buildAndLaunch>[0],
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
        case "xcode_test":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await xcodeTest(
                    args as unknown as Parameters<typeof xcodeTest>[0],
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
        case "xcode_version":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await xcodeVersion(
                    args as unknown as Parameters<typeof xcodeVersion>[0],
                  ),
                ),
              },
            ],
          };

        // Simulator
        case "simulator_list":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorList(
                    args as unknown as Parameters<typeof simulatorList>[0],
                  ),
                ),
              },
            ],
          };
        case "simulator_boot":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorBoot(
                    args as unknown as Parameters<typeof simulatorBoot>[0],
                  ),
                ),
              },
            ],
          };
        case "simulator_shutdown":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorShutdown(
                    args as unknown as Parameters<typeof simulatorShutdown>[0],
                  ),
                ),
              },
            ],
          };
        case "simulator_create":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorCreate(
                    args as unknown as Parameters<typeof simulatorCreate>[0],
                  ),
                ),
              },
            ],
          };
        case "simulator_delete":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorDelete(
                    args as unknown as Parameters<typeof simulatorDelete>[0],
                  ),
                ),
              },
            ],
          };
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
        case "simulator_terminate_app":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorTerminateApp(
                    args as unknown as Parameters<
                      typeof simulatorTerminateApp
                    >[0],
                  ),
                ),
              },
            ],
          };
        case "simulator_screenshot":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorScreenshot(
                    args as unknown as Parameters<
                      typeof simulatorScreenshot
                    >[0],
                  ),
                ),
              },
            ],
          };
        case "simulator_openurl":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorOpenURL(
                    args as unknown as Parameters<typeof simulatorOpenURL>[0],
                  ),
                ),
              },
            ],
          };
        case "simulator_get_app_container":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorGetAppContainer(
                    args as unknown as Parameters<
                      typeof simulatorGetAppContainer
                    >[0],
                  ),
                ),
              },
            ],
          };
        case "simulator_health_check":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await simulatorHealthCheck(
                    args as unknown as Parameters<
                      typeof simulatorHealthCheck
                    >[0],
                  ),
                ),
              },
            ],
          };

        // IDB
        case "idb_describe":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await idbDescribe(
                    args as unknown as Parameters<typeof idbDescribe>[0],
                  ),
                ),
              },
            ],
          };
        case "idb_tap":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await idbTap(args as unknown as Parameters<typeof idbTap>[0]),
                ),
              },
            ],
          };
        case "idb_input":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await idbInput(
                    args as unknown as Parameters<typeof idbInput>[0],
                  ),
                ),
              },
            ],
          };
        case "idb_gesture":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await idbGesture(
                    args as unknown as Parameters<typeof idbGesture>[0],
                  ),
                ),
              },
            ],
          };
        case "idb_find_element":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await idbFindElement(
                    args as unknown as Parameters<typeof idbFindElement>[0],
                  ),
                ),
              },
            ],
          };
        case "idb_check_quality":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await idbCheckQuality(
                    args as unknown as Parameters<typeof idbCheckQuality>[0],
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
    console.error("xc-all MCP server running");
  }
}

const server = new XCAllServer();
server.run().catch(console.error);
