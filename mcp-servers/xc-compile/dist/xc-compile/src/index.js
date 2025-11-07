#!/usr/bin/env node
/**
 * XC-Compile MCP Server
 *
 * Ultra-minimal build execution - just xcode_build
 * Perfect for tight code→build→fix loops with minimal token overhead
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
// Import only build tool
import { xcodeBuild, xcodeBuildDefinition } from '../../shared/tools/xcode/build.js';
class XCCompileServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'xc-compile',
            version: '0.1.0',
            title: 'Build Execution',
            description: 'Ultra-minimal build execution - just build with error extraction',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.registerTools();
    }
    registerTools() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [xcodeBuildDefinition],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'xcode_build':
                    return { content: [{ type: 'text', text: JSON.stringify(await xcodeBuild(args)) }] };
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('xc-compile MCP server running');
    }
}
const server = new XCCompileServer();
server.run().catch(console.error);
