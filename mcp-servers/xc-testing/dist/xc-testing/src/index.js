#!/usr/bin/env node
/**
 * XC-Testing MCP Server
 *
 * E2E testing and validation workflows
 * Tools for running tests and automated UI testing
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
// Import tools
import { xcodeTest, xcodeTestDefinition } from '../../shared/tools/xcode/test.js';
import { idbDescribe, idbDescribeDefinition } from '../../shared/tools/idb/describe.js';
import { idbTap, idbTapDefinition } from '../../shared/tools/idb/tap.js';
import { idbInput, idbInputDefinition } from '../../shared/tools/idb/input.js';
import { idbGesture, idbGestureDefinition } from '../../shared/tools/idb/gesture.js';
import { simulatorScreenshot, simulatorScreenshotDefinition, } from '../../shared/tools/simulator/screenshot.js';
class XCTestingServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'xc-testing',
            version: '0.0.1',
            title: 'Testing & Validation',
            description: 'E2E testing and validation workflows for iOS apps',
        }, {
            capabilities: {
                tools: {},
            }
        });
        this.registerTools();
    }
    registerTools() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                xcodeTestDefinition,
                idbDescribeDefinition,
                idbTapDefinition,
                idbInputDefinition,
                idbGestureDefinition,
                simulatorScreenshotDefinition,
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'xcode_test':
                    return { content: [{ type: 'text', text: JSON.stringify(await xcodeTest(args)) }] };
                case 'idb_describe':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbDescribe(args)) }] };
                case 'idb_tap':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbTap(args)) }] };
                case 'idb_input':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbInput(args)) }] };
                case 'idb_gesture':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbGesture(args)) }] };
                case 'simulator_screenshot':
                    return {
                        content: [{ type: 'text', text: JSON.stringify(await simulatorScreenshot(args)) }],
                    };
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('xc-testing MCP server running');
    }
}
const server = new XCTestingServer();
server.run().catch(console.error);
