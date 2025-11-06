#!/usr/bin/env node

/**
 * xc-plugin MCP Server
 *
 * Token-efficient iOS development automation with 3 consolidated dispatchers.
 * At rest: ~2.2k tokens (88% reduction from xc-mcp's 18.7k)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { XcodeDispatcher } from './dispatchers/xcode.js';
import { SimulatorDispatcher } from './dispatchers/simulator.js';
import { IDBDispatcher } from './dispatchers/idb.js';
import { ResourceCatalog } from './resources/catalog.js';
import { logger } from './utils/logger.js';

// Initialize MCP server
const server = new Server(
  {
    name: 'xc-plugin-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Initialize dispatchers
const xcodeDispatcher = new XcodeDispatcher();
const simulatorDispatcher = new SimulatorDispatcher();
const idbDispatcher = new IDBDispatcher();

// Initialize resource catalog
const resourceCatalog = new ResourceCatalog();

// Register tools (3 dispatchers)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug('Listing tools');

  return {
    tools: [
      xcodeDispatcher.getToolDefinition(),
      simulatorDispatcher.getToolDefinition(),
      idbDispatcher.getToolDefinition(),
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info(`Tool called: ${name}`);
  logger.debug(`Arguments: ${JSON.stringify(args)}`);

  try {
    let result;

    switch (name) {
      case 'execute_xcode_command':
        result = await xcodeDispatcher.execute(args);
        break;

      case 'execute_simulator_command':
        result = await simulatorDispatcher.execute(args);
        break;

      case 'execute_idb_command':
        result = await idbDispatcher.execute(args);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error(`Tool execution failed: ${name}`, error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: error instanceof Error ? error.message : String(error),
              tool: name,
              arguments: args,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Register resources (on-demand documentation)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  logger.debug('Listing resources');
  return {
    resources: resourceCatalog.listResources(),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  logger.info(`Resource requested: ${uri}`);

  try {
    const content = await resourceCatalog.readResource(uri);
    return {
      contents: [
        {
          uri,
          mimeType: 'text/markdown',
          text: content,
        },
      ],
    };
  } catch (error) {
    logger.error(`Resource read failed: ${uri}`, error);
    throw error;
  }
});

// Start server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('xc-plugin MCP server started successfully');
    logger.info('Token overhead: ~2.2k at rest');
    logger.info('Tools: 3 dispatchers registered');
    logger.info('Resources: Available on-demand');
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

main();
