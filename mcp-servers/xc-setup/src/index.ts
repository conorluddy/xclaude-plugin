#!/usr/bin/env node
/**
 * XC-Setup MCP Server
 *
 * Initial environment setup and configuration
 * Tools for discovering simulators, creating devices, and validating environment
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tools
import { simulatorList, simulatorListDefinition } from '../../shared/tools/simulator/list.js';
import { simulatorCreate, simulatorCreateDefinition } from '../../shared/tools/simulator/create.js';
import { simulatorBoot, simulatorBootDefinition } from '../../shared/tools/simulator/boot.js';
import {
  simulatorHealthCheck,
  simulatorHealthCheckDefinition,
} from '../../shared/tools/simulator/health-check.js';
import { xcodeVersion, xcodeVersionDefinition } from '../../shared/tools/xcode/version.js';

class XCSetupServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'xc-setup',
        version: '0.0.1',
        description: 'Initial environment setup and configuration for iOS development',
      },
      {
        capabilities: {
          tools: {},
        },
        instructions: `# XC-Setup MCP

Initial environment setup and device configuration. Enable when:
- Setting up a new development session
- Creating simulator devices
- Validating environment health
- Discovering available simulators

**Workflow:**
1. Check environment with \`simulator_health_check\` and \`xcode_version\`
2. List available devices with \`simulator_list\`
3. Create new devices with \`simulator_create\`
4. Boot devices with \`simulator_boot\`

**Token cost**: ~800 tokens`,
      }
    );

    this.registerTools();
  }

  private registerTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        simulatorListDefinition,
        simulatorCreateDefinition,
        simulatorBootDefinition,
        simulatorHealthCheckDefinition,
        xcodeVersionDefinition,
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'simulator_list':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorList(args)) }] };

        case 'simulator_create':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorCreate(args)) }] };

        case 'simulator_boot':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorBoot(args)) }] };

        case 'simulator_health_check':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorHealthCheck(args)) }] };

        case 'xcode_version':
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeVersion(args)) }] };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('xc-setup MCP server running');
  }
}

const server = new XCSetupServer();
server.run().catch(console.error);
