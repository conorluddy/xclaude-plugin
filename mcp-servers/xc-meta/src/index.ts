#!/usr/bin/env node
/**
 * XC-Meta MCP Server
 *
 * Project configuration and tooling health
 * Tools for managing project metadata and maintenance
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tools
import { xcodeVersion, xcodeVersionDefinition } from '../../shared/tools/xcode/version.js';
import { xcodeList, xcodeListDefinition } from '../../shared/tools/xcode/list.js';
import { xcodeClean, xcodeCleanDefinition } from '../../shared/tools/xcode/clean.js';
import {
  simulatorHealthCheck,
  simulatorHealthCheckDefinition,
} from '../../shared/tools/simulator/health-check.js';
import {
  simulatorDelete,
  simulatorDeleteDefinition,
} from '../../shared/tools/simulator/delete.js';
import {
  simulatorShutdown,
  simulatorShutdownDefinition,
} from '../../shared/tools/simulator/shutdown.js';

class XCMetaServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'xc-meta',
        version: '0.0.1',
        title: 'Project Maintenance',
        description: 'Project configuration, maintenance, and tooling health',
      },
      {
        capabilities: {
          tools: {},
        }
      }
    );

    this.registerTools();
  }

  private registerTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        xcodeVersionDefinition,
        xcodeListDefinition,
        xcodeCleanDefinition,
        simulatorHealthCheckDefinition,
        simulatorDeleteDefinition,
        simulatorShutdownDefinition,
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'xcode_version':
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeVersion(args as unknown as Parameters<typeof xcodeVersion>[0])) }] };

        case 'xcode_list':
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeList(args as unknown as Parameters<typeof xcodeList>[0])) }] };

        case 'xcode_clean':
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeClean(args as unknown as Parameters<typeof xcodeClean>[0])) }] };

        case 'simulator_health_check':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorHealthCheck(args as unknown as Parameters<typeof simulatorHealthCheck>[0])) }] };

        case 'simulator_delete':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorDelete(args as unknown as Parameters<typeof simulatorDelete>[0])) }] };

        case 'simulator_shutdown':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorShutdown(args as unknown as Parameters<typeof simulatorShutdown>[0])) }] };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('xc-meta MCP server running');
  }
}

const server = new XCMetaServer();
server.run().catch(console.error);
