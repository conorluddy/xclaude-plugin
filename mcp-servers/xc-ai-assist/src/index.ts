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
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeBuild(args as unknown as Parameters<typeof xcodeBuild>[0])) }] };

        // UI inspection
        case 'idb_describe':
          return { content: [{ type: 'text', text: JSON.stringify(await idbDescribe(args as unknown as Parameters<typeof idbDescribe>[0])) }] };

        case 'idb_find_element':
          return { content: [{ type: 'text', text: JSON.stringify(await idbFindElement(args as unknown as Parameters<typeof idbFindElement>[0])) }] };

        case 'idb_check_quality':
          return { content: [{ type: 'text', text: JSON.stringify(await idbCheckQuality(args as unknown as Parameters<typeof idbCheckQuality>[0])) }] };

        // UI interaction
        case 'idb_tap':
          return { content: [{ type: 'text', text: JSON.stringify(await idbTap(args as unknown as Parameters<typeof idbTap>[0])) }] };

        case 'idb_input':
          return { content: [{ type: 'text', text: JSON.stringify(await idbInput(args as unknown as Parameters<typeof idbInput>[0])) }] };

        // Screenshot
        case 'simulator_screenshot':
          return {
            content: [{ type: 'text', text: JSON.stringify(await simulatorScreenshot(args as unknown as Parameters<typeof simulatorScreenshot>[0])) }],
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
