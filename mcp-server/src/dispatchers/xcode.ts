/**
 * Xcode Dispatcher
 *
 * Consolidates all xcodebuild operations into a single tool.
 * Token cost: ~400 tokens (vs ~4k for 7 separate tools)
 *
 * Operations: build, clean, test, list, version
 */

import { BaseDispatcher } from './base.js';
import { logger } from '../utils/logger.js';
import type {
  ToolDefinition,
  XcodeOperationArgs,
  XcodeResultData,
  OperationResult,
  BuildParams,
  CleanParams,
  TestParams,
  ListParams,
  BuildResultData,
  TestResultData,
  ListResultData,
  VersionResultData,
} from '../types.js';

export class XcodeDispatcher extends BaseDispatcher<XcodeOperationArgs, XcodeResultData> {
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

  async execute(args: XcodeOperationArgs): Promise<OperationResult<XcodeResultData>> {
    const { operation, project_path, scheme, configuration, destination, options } = args;

    logger.info(`Executing xcode operation: ${operation}`);

    try {
      switch (operation) {
        case 'build':
          if (!scheme) {
            return this.formatError('scheme required for build', operation);
          }
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
          if (!scheme) {
            return this.formatError('scheme required for test', operation);
          }
          return await this.executeTest({
            project_path,
            scheme,
            destination,
            options: options as never, // TestOptions differ from XcodeBuildOptions
          });

        case 'list':
          return await this.executeList({ project_path });

        case 'version':
          return await this.executeVersion();

        default:
          return this.formatError(`Unknown operation: ${operation}`, operation);
      }
    } catch (error) {
      logger.error(`Xcode operation failed: ${operation}`, error as Error);
      return this.formatError(error as Error, operation);
    }
  }

  private async executeBuild(
    params: Partial<BuildParams>
  ): Promise<OperationResult<XcodeResultData>> {
    // Placeholder - will implement with xc-mcp logic
    const data: BuildResultData = {
      message: 'Build operation not yet implemented',
      note: 'Will use xc-mcp xcodebuild wrapper logic',
      params: params as BuildParams,
    };
    return this.formatSuccess(data);
  }

  private async executeClean(params: CleanParams): Promise<OperationResult<XcodeResultData>> {
    // Placeholder
    const data: BuildResultData = {
      message: 'Clean operation not yet implemented',
      params: params as BuildParams, // Clean uses same result format as build
    };
    return this.formatSuccess(data);
  }

  private async executeTest(
    params: Partial<TestParams>
  ): Promise<OperationResult<XcodeResultData>> {
    // Placeholder
    const data: TestResultData = {
      message: 'Test operation not yet implemented',
      params: params as TestParams,
    };
    return this.formatSuccess(data);
  }

  private async executeList(_params: ListParams): Promise<OperationResult<XcodeResultData>> {
    // Placeholder
    const data: ListResultData = {
      message: 'List operation not yet implemented',
    };
    return this.formatSuccess(data);
  }

  private async executeVersion(): Promise<OperationResult<XcodeResultData>> {
    // Placeholder
    const data: VersionResultData = {
      message: 'Version operation not yet implemented',
    };
    return this.formatSuccess(data);
  }
}
