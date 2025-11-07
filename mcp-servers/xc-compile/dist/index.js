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
            description: 'Ultra-minimal build execution - just build with error extraction',
        }, {
            capabilities: {
                tools: {},
            },
            instructions: `# XC-Compile MCP

Ultra-minimal build execution for tight feedback loops.

**Enable when:**
- You're in a code→build→fix cycle
- You need minimal token overhead
- You only care about "did it build?" and "what broke?"

**Single tool:**
- \`xcode_build\` - Build with automatic error extraction (up to 10 errors)

**Workflow:**
1. Edit code
2. Run xcode_build
3. See errors (if any)
4. Fix
5. Repeat

**Token cost**: ~300 tokens (vs ~1400 for xc-ai-assist)

**Note**: For scheme discovery or cleaning, use xc-build instead.`,
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
//# sourceMappingURL=index.js.map