/**
 * Xcode Build Tool
 *
 * Compile Xcode projects with configuration options
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { BuildParams, BuildResultData } from '../../types/xcode.js';
import { runCommand, findXcodeProject, extractBuildErrors } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const xcodeBuildDefinition: ToolDefinition = {
  name: 'xcode_build',
  description: 'Build Xcode project',
  inputSchema: {
    type: 'object',
    properties: {
      project_path: {
        type: 'string',
        description: 'Path to .xcodeproj or .xcworkspace (auto-detected if omitted)',
      },
      scheme: {
        type: 'string',
        description: 'Scheme name (required)',
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
    },
    required: ['scheme'],
  },
};

export async function xcodeBuild(params: BuildParams): Promise<ToolResult<BuildResultData>> {
  try {
    // Validation
    if (!params.scheme) {
      return {
        success: false,
        error: 'Scheme required',
        operation: 'build',
      };
    }

    // Find project if not specified
    const projectPath = params.project_path || (await findXcodeProject());
    if (!projectPath) {
      return {
        success: false,
        error: 'No Xcode project found in current directory',
        operation: 'build',
      };
    }

    // Build command args
    const args = ['-scheme', params.scheme, '-configuration', params.configuration || 'Debug'];

    if (projectPath.endsWith('.xcworkspace')) {
      args.unshift('-workspace', projectPath);
    } else {
      args.unshift('-project', projectPath);
    }

    if (params.destination) {
      args.push('-destination', params.destination);
    }

    args.push('build');

    // Execute build
    logger.info(`Building project: ${params.scheme}`);
    const startTime = Date.now();
    const result = await runCommand('xcodebuild', args);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Extract errors if build failed
    const errors = result.code !== 0 ? extractBuildErrors(result.stdout + '\n' + result.stderr) : undefined;

    // Return result
    const data: BuildResultData = {
      message: `Build ${result.code === 0 ? 'succeeded' : 'failed'} in ${duration}s`,
      duration,
      errors,
    };

    return {
      success: result.code === 0,
      data,
      summary: `Build ${result.code === 0 ? 'succeeded' : 'failed'}`,
    };
  } catch (error) {
    logger.error('Build failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'build',
    };
  }
}
