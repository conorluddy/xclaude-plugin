# 02 - MCP Server Architecture

**Purpose**: Define the MCP server implementation with 3 consolidated dispatchers and supporting infrastructure.

## Architecture Overview

The MCP server consolidates 52+ individual tools into 3 semantic dispatchers that group operations by domain. This reduces token overhead from 30-50k to 3-5k tokens (85-90% reduction) while maintaining full functionality.

**Key Design Principles**:
1. **Semantic dispatchers**: Operations grouped by domain, not CRUD
2. **File-based responses**: Large outputs written to files, summaries returned
3. **Resource-based documentation**: Operation details in MCP resources, not tool descriptions
4. **Progressive disclosure**: Full data available but not loaded until needed
5. **Operation hints**: Annotations guide common usage patterns

## Server Entry Point

**src/index.ts**:
```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { BuildToolsDispatcher } from './dispatchers/build-tools.js';
import { SimulatorToolsDispatcher } from './dispatchers/simulator-tools.js';
import { AdvancedToolsDispatcher } from './dispatchers/advanced-tools.js';
import { OperationCatalog } from './resources/operation-catalog.js';
import { Logger } from './utils/logger.js';
import { ErrorHandler } from './utils/error-handler.js';

// Initialize logger
const logger = new Logger('xc-mcp');

// Initialize server
const server = new Server(
  {
    name: 'xc-mcp-server',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Initialize dispatchers
const buildDispatcher = new BuildToolsDispatcher(logger);
const simulatorDispatcher = new SimulatorToolsDispatcher(logger);
const advancedDispatcher = new AdvancedToolsDispatcher(logger);

// Initialize operation catalog
const catalog = new OperationCatalog();

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    buildDispatcher.getToolDefinition(),
    simulatorDispatcher.getToolDefinition(),
    advancedDispatcher.getToolDefinition(),
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case 'execute_build_command':
        result = await buildDispatcher.execute(args);
        break;
      case 'execute_simulator_command':
        result = await simulatorDispatcher.execute(args);
        break;
      case 'execute_advanced_operation':
        result = await advancedDispatcher.execute(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return ErrorHandler.handleToolError(error, name, args);
  }
});

// Register resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: catalog.listResources(),
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const resource = await catalog.readResource(request.params.uri);
  return {
    contents: [resource],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('XC MCP Server started');
}

main().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
```

## Dispatcher Base Class

**src/dispatchers/types.ts**:
```typescript
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  annotations?: {
    usage_hints?: string;
    resource_ref?: string;
    token_cost?: string;
  };
}

export interface DispatcherResult {
  success: boolean;
  summary?: string;
  output_file?: string;
  cache_id?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface FileProcessingOptions {
  outputFormat: 'summary' | 'detailed' | 'file';
  tokenLimit?: number;
  includeMetadata?: boolean;
}

export abstract class BaseDispatcher {
  constructor(protected logger: Logger) {}

  abstract getToolDefinition(): ToolDefinition;
  abstract execute(args: any): Promise<DispatcherResult>;

  protected async processLargeOutput(
    data: any,
    options: FileProcessingOptions
  ): Promise<DispatcherResult> {
    if (options.outputFormat === 'file') {
      const filePath = await ResponseWriter.writeToFile(data);
      const summary = SummaryGenerator.generate(data, options.tokenLimit || 300);
      
      return {
        success: true,
        summary,
        output_file: filePath,
        cache_id: this.generateCacheId(data),
      };
    }

    if (options.outputFormat === 'summary') {
      return {
        success: true,
        summary: SummaryGenerator.generate(data, options.tokenLimit || 500),
      };
    }

    // Detailed format
    return {
      success: true,
      summary: JSON.stringify(data, null, 2),
    };
  }

  protected generateCacheId(data: any): string {
    // Create deterministic cache ID based on content
    const hash = createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex').substring(0, 16);
  }
}
```

## Dispatcher 1: Build Tools

**src/dispatchers/build-tools.ts**:
```typescript
import { BaseDispatcher, ToolDefinition, DispatcherResult } from './types.js';
import { XcodeBuild } from '../xcode/xcodebuild.js';
import { ProjectDetector } from '../xcode/project-detector.js';
import { Logger } from '../utils/logger.js';

export class BuildToolsDispatcher extends BaseDispatcher {
  private xcodebuild: XcodeBuild;
  private detector: ProjectDetector;

  constructor(logger: Logger) {
    super(logger);
    this.xcodebuild = new XcodeBuild(logger);
    this.detector = new ProjectDetector();
  }

  getToolDefinition(): ToolDefinition {
    return {
      name: 'execute_build_command',
      description: 'Execute Xcode build system operations including build, test, clean, analyze, and project inspection',
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: [
              'build',
              'test',
              'clean',
              'analyze',
              'list-schemes',
              'list-targets',
              'list-configurations',
              'show-build-settings',
              'validate-project',
              'archive',
            ],
            description: 'Build operation to execute',
          },
          project_path: {
            type: 'string',
            description: 'Path to .xcodeproj or .xcworkspace (auto-detected if omitted)',
          },
          scheme: {
            type: 'string',
            description: 'Scheme name (required for build/test/archive)',
          },
          configuration: {
            type: 'string',
            enum: ['Debug', 'Release'],
            description: 'Build configuration',
          },
          destination: {
            type: 'string',
            description: 'Build destination (e.g., "platform=iOS Simulator,name=iPhone 15")',
          },
          options: {
            type: 'object',
            description: 'Operation-specific parameters',
            properties: {
              clean_before_build: { type: 'boolean' },
              parallel: { type: 'boolean' },
              quiet: { type: 'boolean' },
              verbose: { type: 'boolean' },
              sdk: { type: 'string' },
              arch: { type: 'string' },
            },
          },
          output_format: {
            type: 'string',
            enum: ['summary', 'detailed', 'file'],
            default: 'summary',
            description: 'Response format - "file" writes to temp file and returns path',
          },
        },
        required: ['operation'],
      },
      annotations: {
        usage_hints: 'Common: build (compile), test (run tests), clean (remove artifacts), list-schemes (show schemes)',
        resource_ref: 'operation-catalog://build-tools',
        token_cost: 'Summary: ~300 tokens, File: ~50 tokens + file path',
      },
    };
  }

  async execute(args: any): Promise<DispatcherResult> {
    const { operation, project_path, scheme, configuration, destination, options, output_format } = args;

    try {
      // Auto-detect project if not provided
      const projectPath = project_path || await this.detector.findProject();
      if (!projectPath) {
        return {
          success: false,
          error: 'No Xcode project found. Specify project_path or run from project directory.',
        };
      }

      // Execute operation
      let result: any;
      switch (operation) {
        case 'build':
          result = await this.xcodebuild.build({
            projectPath,
            scheme,
            configuration: configuration || 'Debug',
            destination,
            options,
          });
          break;

        case 'test':
          result = await this.xcodebuild.test({
            projectPath,
            scheme,
            destination,
            options,
          });
          break;

        case 'clean':
          result = await this.xcodebuild.clean({ projectPath, scheme });
          break;

        case 'list-schemes':
          result = await this.xcodebuild.listSchemes(projectPath);
          break;

        case 'list-targets':
          result = await this.xcodebuild.listTargets(projectPath);
          break;

        case 'list-configurations':
          result = await this.xcodebuild.listConfigurations(projectPath);
          break;

        case 'show-build-settings':
          result = await this.xcodebuild.showBuildSettings({
            projectPath,
            scheme,
            configuration,
          });
          break;

        case 'validate-project':
          result = await this.xcodebuild.validateProject(projectPath);
          break;

        case 'archive':
          result = await this.xcodebuild.archive({
            projectPath,
            scheme,
            configuration: configuration || 'Release',
            options,
          });
          break;

        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`,
          };
      }

      // Process output based on format
      return await this.processLargeOutput(result, {
        outputFormat: output_format || 'summary',
        tokenLimit: 300,
        includeMetadata: true,
      });

    } catch (error) {
      this.logger.error('Build operation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

## Dispatcher 2: Simulator Tools

**src/dispatchers/simulator-tools.ts**:
```typescript
import { BaseDispatcher, ToolDefinition, DispatcherResult } from './types.js';
import { Simctl } from '../xcode/simctl.js';
import { AccessibilityTree } from '../xcode/accessibility.js';
import { Logger } from '../utils/logger.js';

export class SimulatorToolsDispatcher extends BaseDispatcher {
  private simctl: Simctl;
  private accessibility: AccessibilityTree;

  constructor(logger: Logger) {
    super(logger);
    this.simctl = new Simctl(logger);
    this.accessibility = new AccessibilityTree(logger);
  }

  getToolDefinition(): ToolDefinition {
    return {
      name: 'execute_simulator_command',
      description: 'Control iOS Simulator including device management, app lifecycle, I/O operations, and diagnostics',
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: [
              // Device management
              'list', 'boot', 'shutdown', 'create', 'delete', 'clone',
              // App lifecycle
              'install', 'uninstall', 'launch', 'terminate',
              // I/O operations
              'openurl', 'get-app-container', 'io-screenshot', 'io-recordVideo',
              // Configuration
              'status-bar', 'privacy', 'ui-appearance', 'location', 'keychain',
              // Diagnostics
              'diagnose', 'logStream', 'push-notification',
            ],
            description: 'Simulator operation to execute',
          },
          device_id: {
            type: 'string',
            description: 'Device UDID or name (e.g., "iPhone 15" or device UDID)',
          },
          app_identifier: {
            type: 'string',
            description: 'App bundle identifier (e.g., "com.example.MyApp")',
          },
          options: {
            type: 'object',
            description: 'Operation-specific parameters',
            properties: {
              use_accessibility: {
                type: 'boolean',
                description: 'Prefer accessibility-based navigation over screenshots',
                default: true,
              },
              wait_for_boot: { type: 'boolean' },
              erase: { type: 'boolean' },
              device_type: { type: 'string' },
              runtime: { type: 'string' },
              location_lat: { type: 'number' },
              location_lon: { type: 'number' },
              privacy_action: {
                type: 'string',
                enum: ['grant', 'revoke', 'reset'],
              },
              privacy_service: {
                type: 'string',
                enum: ['photos', 'camera', 'contacts', 'location', 'microphone'],
              },
              appearance: {
                type: 'string',
                enum: ['light', 'dark'],
              },
            },
          },
          output_format: {
            type: 'string',
            enum: ['summary', 'detailed', 'file'],
            default: 'summary',
          },
        },
        required: ['operation'],
      },
      annotations: {
        usage_hints: 'Common: list (show devices), boot (start), install (add app), launch (run), io-screenshot (capture)',
        resource_ref: 'operation-catalog://simulator-tools',
        token_cost: 'List summary: ~500 tokens, Full list: file-based',
      },
    };
  }

  async execute(args: any): Promise<DispatcherResult> {
    const { operation, device_id, app_identifier, options, output_format } = args;

    try {
      // Execute operation
      let result: any;

      switch (operation) {
        case 'list':
          result = await this.simctl.listDevices();
          // List can be large, default to file-based processing
          return await this.processLargeOutput(result, {
            outputFormat: output_format || 'file',
            tokenLimit: 500,
          });

        case 'boot':
          await this.simctl.boot(device_id, options?.wait_for_boot);
          result = { status: 'booted', device_id };
          break;

        case 'shutdown':
          await this.simctl.shutdown(device_id);
          result = { status: 'shutdown', device_id };
          break;

        case 'create':
          const deviceUDID = await this.simctl.create({
            name: device_id,
            deviceType: options?.device_type,
            runtime: options?.runtime,
          });
          result = { device_id: deviceUDID, status: 'created' };
          break;

        case 'delete':
          await this.simctl.delete(device_id);
          result = { status: 'deleted', device_id };
          break;

        case 'install':
          await this.simctl.install(device_id, app_identifier);
          result = { status: 'installed', app_identifier };
          break;

        case 'uninstall':
          await this.simctl.uninstall(device_id, app_identifier);
          result = { status: 'uninstalled', app_identifier };
          break;

        case 'launch':
          // Check if we should use accessibility-based navigation
          if (options?.use_accessibility !== false) {
            const accessibilityData = await this.accessibility.getTree(device_id);
            if (accessibilityData.available) {
              result = await this.accessibility.launchApp(device_id, app_identifier);
              break;
            }
          }
          // Fallback to standard launch
          result = await this.simctl.launch(device_id, app_identifier, options);
          break;

        case 'terminate':
          await this.simctl.terminate(device_id, app_identifier);
          result = { status: 'terminated', app_identifier };
          break;

        case 'io-screenshot':
          const screenshotPath = await this.simctl.screenshot(device_id, options);
          result = { screenshot_path: screenshotPath };
          break;

        case 'io-recordVideo':
          const videoPath = await this.simctl.recordVideo(device_id, options);
          result = { video_path: videoPath };
          break;

        case 'privacy':
          await this.simctl.privacy(device_id, {
            action: options?.privacy_action,
            service: options?.privacy_service,
            bundleId: app_identifier,
          });
          result = { status: 'privacy_updated' };
          break;

        case 'ui-appearance':
          await this.simctl.setAppearance(device_id, options?.appearance);
          result = { appearance: options?.appearance };
          break;

        case 'location':
          await this.simctl.setLocation(device_id, {
            latitude: options?.location_lat,
            longitude: options?.location_lon,
          });
          result = { location_set: true };
          break;

        case 'diagnose':
          result = await this.simctl.diagnose(device_id);
          return await this.processLargeOutput(result, {
            outputFormat: output_format || 'file',
            tokenLimit: 1000,
          });

        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`,
          };
      }

      return {
        success: true,
        summary: JSON.stringify(result, null, 2),
        metadata: {
          operation,
          device_id,
          timestamp: new Date().toISOString(),
        },
      };

    } catch (error) {
      this.logger.error('Simulator operation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

## Dispatcher 3: Advanced Operations

**src/dispatchers/advanced-tools.ts**:
```typescript
import { BaseDispatcher, ToolDefinition, DispatcherResult } from './types.js';
import { IDB } from '../xcode/idb.js';
import { CacheManager } from '../file-processing/cache-manager.js';
import { Logger } from '../utils/logger.js';

export class AdvancedToolsDispatcher extends BaseDispatcher {
  private idb: IDB;
  private cache: CacheManager;

  constructor(logger: Logger) {
    super(logger);
    this.idb = new IDB(logger);
    this.cache = new CacheManager(logger);
  }

  getToolDefinition(): ToolDefinition {
    return {
      name: 'execute_advanced_operation',
      description: 'Advanced operations including IDB debugging, cache management, persistence, and workflow automation',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['idb', 'cache', 'persistence', 'workflow'],
            description: 'Operation category',
          },
          operation: {
            type: 'string',
            description: 'Specific operation within category',
          },
          target: {
            type: 'string',
            description: 'Target device/app/file identifier',
          },
          parameters: {
            type: 'object',
            description: 'Category and operation-specific parameters',
          },
          output_format: {
            type: 'string',
            enum: ['summary', 'detailed', 'file'],
            default: 'summary',
          },
        },
        required: ['category', 'operation'],
      },
      annotations: {
        usage_hints: 'IDB for debugging, cache for optimization, persistence for state, workflow for automation',
        resource_ref: 'operation-catalog://advanced-tools',
        token_cost: 'Varies by operation, workflow operations may use file-based processing',
      },
    };
  }

  async execute(args: any): Promise<DispatcherResult> {
    const { category, operation, target, parameters, output_format } = args;

    try {
      let result: any;

      switch (category) {
        case 'idb':
          result = await this.executeIDBOperation(operation, target, parameters);
          break;

        case 'cache':
          result = await this.executeCacheOperation(operation, target, parameters);
          break;

        case 'persistence':
          result = await this.executePersistenceOperation(operation, target, parameters);
          break;

        case 'workflow':
          result = await this.executeWorkflowOperation(operation, target, parameters);
          return await this.processLargeOutput(result, {
            outputFormat: output_format || 'file',
            tokenLimit: 1000,
          });

        default:
          return {
            success: false,
            error: `Unknown category: ${category}`,
          };
      }

      return {
        success: true,
        summary: JSON.stringify(result, null, 2),
        metadata: {
          category,
          operation,
          timestamp: new Date().toISOString(),
        },
      };

    } catch (error) {
      this.logger.error('Advanced operation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async executeIDBOperation(operation: string, target: string, params: any): Promise<any> {
    switch (operation) {
      case 'list-targets':
        return await this.idb.listTargets();
      case 'connect':
        return await this.idb.connect(target);
      case 'install':
        return await this.idb.install(target, params.app_path);
      case 'launch':
        return await this.idb.launch(target, params.bundle_id);
      case 'debugserver':
        return await this.idb.startDebugServer(target, params.bundle_id);
      case 'pull':
        return await this.idb.pull(target, params.src_path, params.dst_path);
      case 'push':
        return await this.idb.push(target, params.src_path, params.dst_path);
      case 'crash-list':
        return await this.idb.listCrashes(target);
      default:
        throw new Error(`Unknown IDB operation: ${operation}`);
    }
  }

  private async executeCacheOperation(operation: string, target: string, params: any): Promise<any> {
    switch (operation) {
      case 'get-cached-result':
        return await this.cache.get(target);
      case 'invalidate-cache':
        return await this.cache.invalidate(target);
      case 'cache-statistics':
        return await this.cache.getStatistics();
      case 'warm-cache':
        return await this.cache.warm(params.operations);
      default:
        throw new Error(`Unknown cache operation: ${operation}`);
    }
  }

  private async executePersistenceOperation(operation: string, target: string, params: any): Promise<any> {
    // Implement persistence operations for saving/loading state
    // This would integrate with file system for workflow state management
    throw new Error('Persistence operations not yet implemented');
  }

  private async executeWorkflowOperation(operation: string, target: string, params: any): Promise<any> {
    // Implement complex workflow orchestration
    // e.g., complete test suite, build-and-deploy pipeline, diagnostics capture
    throw new Error('Workflow operations not yet implemented');
  }
}
```

## File Processing System

The file processing system handles large outputs by writing to temporary files and returning compact summaries.

**src/file-processing/response-writer.ts**:
```typescript
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export class ResponseWriter {
  private static OUTPUT_DIR = join(tmpdir(), 'xc-plugin');

  static async ensureOutputDir(): Promise<void> {
    await mkdir(this.OUTPUT_DIR, { recursive: true });
  }

  static async writeToFile(data: any, prefix = 'output'): Promise<string> {
    await this.ensureOutputDir();
    
    const timestamp = Date.now();
    const filename = `${prefix}_${timestamp}.json`;
    const filepath = join(this.OUTPUT_DIR, filename);
    
    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    
    return filepath;
  }

  static async writeBinaryToFile(data: Buffer, prefix = 'output', extension = 'bin'): Promise<string> {
    await this.ensureOutputDir();
    
    const timestamp = Date.now();
    const filename = `${prefix}_${timestamp}.${extension}`;
    const filepath = join(this.OUTPUT_DIR, filename);
    
    await writeFile(filepath, data);
    
    return filepath;
  }
}
```

**src/file-processing/summary-generator.ts**:
```typescript
export class SummaryGenerator {
  static generate(data: any, maxTokens = 300): string {
    // Estimate: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;

    if (typeof data === 'string') {
      return this.truncateString(data, maxChars);
    }

    if (Array.isArray(data)) {
      return this.summarizeArray(data, maxChars);
    }

    if (typeof data === 'object') {
      return this.summarizeObject(data, maxChars);
    }

    return String(data).substring(0, maxChars);
  }

  private static truncateString(str: string, maxChars: number): string {
    if (str.length <= maxChars) {
      return str;
    }

    const halfChars = Math.floor(maxChars / 2) - 20;
    return `${str.substring(0, halfChars)}\n\n... [truncated ${str.length - maxChars} characters] ...\n\n${str.substring(str.length - halfChars)}`;
  }

  private static summarizeArray(arr: any[], maxChars: number): string {
    const summary = {
      total_items: arr.length,
      first_items: arr.slice(0, 3),
      last_items: arr.length > 3 ? arr.slice(-2) : [],
      sample_structure: arr.length > 0 ? Object.keys(arr[0] || {}) : [],
    };

    const jsonStr = JSON.stringify(summary, null, 2);
    return this.truncateString(jsonStr, maxChars);
  }

  private static summarizeObject(obj: any, maxChars: number): string {
    // For build results, extract key statistics
    if (obj.warnings !== undefined || obj.errors !== undefined) {
      return this.summarizeBuildResult(obj, maxChars);
    }

    // For device lists, show counts and types
    if (obj.devices || obj.runtimes) {
      return this.summarizeDeviceList(obj, maxChars);
    }

    // Generic object summary
    const summary = {
      keys: Object.keys(obj),
      sample_values: Object.fromEntries(
        Object.entries(obj).slice(0, 5).map(([k, v]) => [
          k,
          typeof v === 'object' ? `<${typeof v}>` : v,
        ])
      ),
    };

    return JSON.stringify(summary, null, 2);
  }

  private static summarizeBuildResult(result: any, maxChars: number): string {
    const summary = {
      success: result.success,
      warnings: result.warnings || 0,
      errors: result.errors || 0,
      duration: result.duration,
      key_messages: result.messages?.slice(0, 5) || [],
    };

    return JSON.stringify(summary, null, 2);
  }

  private static summarizeDeviceList(data: any, maxChars: number): string {
    const deviceCounts: Record<string, number> = {};
    
    if (data.devices) {
      for (const runtime in data.devices) {
        const devices = data.devices[runtime];
        deviceCounts[runtime] = devices.length;
      }
    }

    const summary = {
      total_runtimes: Object.keys(deviceCounts).length,
      device_counts: deviceCounts,
      sample_devices: data.devices ? Object.values(data.devices).flat().slice(0, 3) : [],
    };

    return JSON.stringify(summary, null, 2);
  }
}
```

## Next Steps

1. Implement the three dispatchers with full operation coverage
2. Build the xcodebuild, simctl, and IDB wrapper utilities
3. Implement file-based processing system
4. Add operation catalog as MCP resources
5. Write comprehensive tests for each dispatcher

Proceed to [03-tool-specifications.md](./03-tool-specifications.md) for detailed operation specifications.
