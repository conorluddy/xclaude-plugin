#!/usr/bin/env node
/**
 * XC-Build MCP Server
 *
 * Minimal build validation MCP - just build, clean, and list schemes
 * Perfect for CI/CD or quick validation workflows
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool definitions and implementations
import { xcodeBuild, xcodeBuildDefinition } from '../../shared/tools/xcode/build.js';
import { xcodeClean, xcodeCleanDefinition } from '../../shared/tools/xcode/clean.js';
import { xcodeList, xcodeListDefinition } from '../../shared/tools/xcode/list.js';

class XCBuildServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'xc-build',
        version: '0.0.1',
        description:
          'Minimal build validation MCP - build, clean, list. For CI/CD and quick validation.',
      },
      {
        capabilities: {
          tools: {},
        },
        instructions: `# XC-Build MCP

Minimal Xcode build validation tools. Enable this MCP when you need:
- Build validation (CI/CD)
- Quick compilation checks
- Scheme discovery

**Available tools:**
- \`xcode_build\` - Build Xcode project
- \`xcode_clean\` - Clean build artifacts
- \`xcode_list\` - List available schemes

**Token cost**: ~600 tokens (vs ~3500 for full toolset)`,
      }
    );

    this.registerTools();
  }

  private registerTools() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [xcodeBuildDefinition, xcodeCleanDefinition, xcodeListDefinition],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'xcode_build':
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeBuild(args)) }] };

        case 'xcode_clean':
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeClean(args)) }] };

        case 'xcode_list':
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeList(args)) }] };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('xc-build MCP server running');
  }
}

const server = new XCBuildServer();
server.run().catch(console.error);
