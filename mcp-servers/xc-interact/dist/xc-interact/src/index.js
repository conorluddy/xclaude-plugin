#!/usr/bin/env node
/**
 * XC-Interact MCP Server
 *
 * Pure UI interaction toolkit - no build tools
 * Perfect for testing UI flows when app is already built and running
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
// Import IDB tools only
import { idbDescribe, idbDescribeDefinition } from '../../shared/tools/idb/describe.js';
import { idbTap, idbTapDefinition } from '../../shared/tools/idb/tap.js';
import { idbInput, idbInputDefinition } from '../../shared/tools/idb/input.js';
import { idbGesture, idbGestureDefinition } from '../../shared/tools/idb/gesture.js';
import { idbFindElement, idbFindElementDefinition, } from '../../shared/tools/idb/find-element.js';
import { idbCheckQuality, idbCheckQualityDefinition, } from '../../shared/tools/idb/check-quality.js';
class XCInteractServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'xc-interact',
            version: '0.1.0',
            description: 'Pure UI interaction toolkit - accessibility-first automation',
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
                case 'idb_describe':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbDescribe(args)) }] };
                case 'idb_tap':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbTap(args)) }] };
                case 'idb_input':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbInput(args)) }] };
                case 'idb_gesture':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbGesture(args)) }] };
                case 'idb_find_element':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbFindElement(args)) }] };
                case 'idb_check_quality':
                    return { content: [{ type: 'text', text: JSON.stringify(await idbCheckQuality(args)) }] };
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('xc-interact MCP server running');
    }
}
const server = new XCInteractServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map