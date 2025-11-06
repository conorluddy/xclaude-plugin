/**
 * Xcode Dispatcher
 *
 * Consolidates all xcodebuild operations into a single tool.
 * Token cost: ~400 tokens (vs ~4k for 7 separate tools)
 *
 * Operations: build, clean, test, list, version
 */

import { BaseDispatcher, ToolDefinition } from './base.js';
import { logger } from '../utils/logger.js';

export class XcodeDispatcher extends BaseDispatcher {
  getToolDefinition(): ToolDefinition {
    return {
      name: 'execute_xcode_command',
      description:
        'Execute Xcode build system operations. Use xcode-workflows Skill for guidance on when/how to use operations.',
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['build', 'clean', 'test', 'list', 'version'],
            description:
              'Operation: build (compile project), clean (remove artifacts), test (run tests), list (show schemes/targets), version (Xcode info)',
          },
          project_path: {
            type: 'string',
            description: 'Path to .xcodeproj or .xcworkspace (auto-detected if omitted)',
          },
          scheme: {
            type: 'string',
            description: 'Scheme name (required for build/test)',
          },
          configuration: {
            type: 'string',
            enum: ['Debug', 'Release'],
            description: 'Build configuration (default: Debug)',
          },
          destination: {
            type: 'string',
            description: 'Build destination, e.g. "platform=iOS Simulator,name=iPhone 15"',
          },
          options: {
            type: 'object',
            description:
              'Additional options (clean_before_build, parallel, quiet, sdk, arch, etc.)',
          },
        },
        required: ['operation'],
      },
    };
  }

  async execute(args: any): Promise<any> {
    const { operation, project_path, scheme, configuration, destination, options } = args;

    logger.info(`Executing xcode operation: ${operation}`);

    try {
      switch (operation) {
        case 'build':
          return await this.executeBuild({
            project_path,
            scheme,
            configuration: configuration || 'Debug',
            destination,
            options,
          });

        case 'clean':
          return await this.executeClean({ project_path, scheme });

        case 'test':
          return await this.executeTest({
            project_path,
            scheme,
            destination,
            options,
          });

        case 'list':
          return await this.executeList({ project_path });

        case 'version':
          return await this.executeVersion();

        default:
          return this.formatError(`Unknown operation: ${operation}`, operation);
      }
    } catch (error) {
      logger.error(`Xcode operation failed: ${operation}`, error);
      return this.formatError(error, operation);
    }
  }

  private async executeBuild(params: any): Promise<any> {
    // Placeholder - will implement with xc-mcp logic
    return this.formatSuccess({
      message: 'Build operation not yet implemented',
      note: 'Will use xc-mcp xcodebuild wrapper logic',
      params,
    });
  }

  private async executeClean(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'Clean operation not yet implemented',
      params,
    });
  }

  private async executeTest(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'Test operation not yet implemented',
      params,
    });
  }

  private async executeList(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'List operation not yet implemented',
      params,
    });
  }

  private async executeVersion(): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'Version operation not yet implemented',
    });
  }
}
