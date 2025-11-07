#!/usr/bin/env node
/**
 * XC-Interact MCP Server
 *
 * Pure UI interaction toolkit - no build tools
 * Perfect for testing UI flows when app is already built and running
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import IDB tools only
import { idbDescribe, idbDescribeDefinition } from '../../shared/tools/idb/describe.js';
import { idbTap, idbTapDefinition } from '../../shared/tools/idb/tap.js';
import { idbInput, idbInputDefinition } from '../../shared/tools/idb/input.js';
import { idbGesture, idbGestureDefinition } from '../../shared/tools/idb/gesture.js';
import {
  idbFindElement,
  idbFindElementDefinition,
} from '../../shared/tools/idb/find-element.js';
import {
  idbCheckQuality,
  idbCheckQualityDefinition,
} from '../../shared/tools/idb/check-quality.js';

class XCInteractServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'xc-interact',
        version: '0.1.0',
        description: 'Pure UI interaction toolkit - accessibility-first automation',
      },
      {
        capabilities: {
          tools: {},
        },
        instructions: `# XC-Interact MCP

Pure UI interaction toolkit for testing flows without build overhead.

**Enable when:**
- Testing UI flows (app already built and running)
- Automating UI interactions
- Exploring UI without rebuilding
- Need UI tools without build/device management

**Accessibility-First Workflow:**

1. **Check quality**: \`idb_check_quality\` - Is accessibility data sufficient?
2. **Query UI**: \`idb_describe\` - Get full accessibility tree (~50 tokens, 120ms)
3. **Find elements**: \`idb_find_element\` - Search by label (semantic)
4. **Interact**:
   - \`idb_tap\` - Tap at coordinates
   - \`idb_input\` - Type text or press keys
   - \`idb_gesture\` - Swipes and hardware buttons

**Why accessibility-first?**
- 3-4x faster than screenshots (120ms vs 2000ms)
- 80% cheaper (~50 tokens vs ~170 tokens)
- More reliable (survives theme changes)
- Works offline (no visual processing)

**Token cost**: ~900 tokens

**Note**: For build + UI automation, use xc-ai-assist instead.`,
      }
    );

    this.registerTools();
  }

  private registerTools() {
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
