/**
 * Xcode Clean Tool
 *
 * Remove build artifacts
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { CleanParams, BuildResultData } from '../../types/xcode.js';
import { runCommand, findXcodeProject } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const xcodeCleanDefinition: ToolDefinition = {
  name: 'xcode_clean',
  description: 'Clean Xcode build artifacts',
  inputSchema: {
    type: 'object',
    properties: {
      project_path: {
        type: 'string',
        description: 'Path to .xcodeproj or .xcworkspace (auto-detected if omitted)',
      },
      scheme: {
        type: 'string',
        description: 'Scheme name (optional - cleans all if not specified)',
      },
    },
  },
};

export async function xcodeClean(params: CleanParams): Promise<ToolResult<BuildResultData>> {
  try {
    // Find project if not specified
    const projectPath = params.project_path || (await findXcodeProject());
    if (!projectPath) {
      return {
        success: false,
        error: 'No Xcode project found in current directory',
        operation: 'clean',
      };
    }

    // Build command args
    const args = [];

    if (projectPath.endsWith('.xcworkspace')) {
      args.push('-workspace', projectPath);
    } else {
      args.push('-project', projectPath);
    }

    if (params.scheme) {
      args.push('-scheme', params.scheme);
    }

    args.push('clean');

    // Execute clean
    logger.info(`Cleaning project${params.scheme ? `: ${params.scheme}` : ''}`);
    const result = await runCommand('xcodebuild', args);

    const data: BuildResultData = {
      message: 'Clean completed successfully',
      note: result.stdout.includes('CLEAN SUCCEEDED') ? 'Build artifacts removed' : undefined,
    };

    if (result.code === 0) {
      return {
        success: true as const,
        data,
        summary: 'Clean completed',
      };
    } else {
      return {
        success: false as const,
        error: 'Clean failed',
        details: result.stderr,
      };
    }
  } catch (error) {
    logger.error('Clean failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'clean',
    };
  }
}
