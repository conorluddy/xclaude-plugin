#!/usr/bin/env node
/**
 * XC-AI-Assist MCP Server
 *
 * AI-driven UI automation and feedback loop
 * Tools for building, UI inspection, interaction, and screenshots
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import Xcode tools
import { xcodeBuild, xcodeBuildDefinition } from '../../shared/tools/xcode/build.js';

// Import simulator tools
import {
  simulatorScreenshot,
  simulatorScreenshotDefinition,
} from '../../shared/tools/simulator/screenshot.js';

// Import IDB tools (core AI workflow)
import { idbDescribe, idbDescribeDefinition } from '../../shared/tools/idb/describe.js';
import { idbTap, idbTapDefinition } from '../../shared/tools/idb/tap.js';
import { idbInput, idbInputDefinition } from '../../shared/tools/idb/input.js';
import {
  idbFindElement,
  idbFindElementDefinition,
} from '../../shared/tools/idb/find-element.js';
import {
  idbCheckQuality,
  idbCheckQualityDefinition,
} from '../../shared/tools/idb/check-quality.js';

class XCAIAssistServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'xc-ai-assist',
        version: '0.0.1',
        description:
          'AI-driven UI automation - accessibility-first approach with build validation',
      },
      {
        capabilities: {
          tools: {},
        },
        instructions: `# XC-AI-Assist MCP

AI-driven UI automation and feedback loop. Enable when:
- AI is making UI changes and needs feedback
- Iterating on UI/UX improvements
- Testing UI flows automatically

**Workflow:**
1. Build with \`xcode_build\`
2. Check accessibility with \`idb_check_quality\`
3. Query UI with \`idb_describe\` (faster) or \`simulator_screenshot\` (fallback)
4. Find elements with \`idb_find_element\`
5. Interact with \`idb_tap\` and \`idb_input\`

**Token cost**: ~1400 tokens`,
      }
    );

    this.registerTools();
  }

  private registerTools() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Build
        xcodeBuildDefinition,
        // UI inspection
        idbDescribeDefinition,
        idbFindElementDefinition,
        idbCheckQualityDefinition,
        // UI interaction
        idbTapDefinition,
        idbInputDefinition,
        // Screenshot (fallback)
        simulatorScreenshotDefinition,
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        // Build
        case 'xcode_build':
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeBuild(args)) }] };

        // UI inspection
        case 'idb_describe':
          return { content: [{ type: 'text', text: JSON.stringify(await idbDescribe(args)) }] };

        case 'idb_find_element':
          return { content: [{ type: 'text', text: JSON.stringify(await idbFindElement(args)) }] };

        case 'idb_check_quality':
          return { content: [{ type: 'text', text: JSON.stringify(await idbCheckQuality(args)) }] };

        // UI interaction
        case 'idb_tap':
          return { content: [{ type: 'text', text: JSON.stringify(await idbTap(args)) }] };

        case 'idb_input':
          return { content: [{ type: 'text', text: JSON.stringify(await idbInput(args)) }] };

        // Screenshot
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
    console.error('xc-ai-assist MCP server running');
  }
}

const server = new XCAIAssistServer();
server.run().catch(console.error);
