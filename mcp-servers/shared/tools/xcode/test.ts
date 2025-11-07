/**
 * Xcode Test Tool
 *
 * Run test suites with result parsing
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { TestParams, TestResultData } from '../../types/xcode.js';
import { runCommand, findXcodeProject } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const xcodeTestDefinition: ToolDefinition = {
  name: 'xcode_test',
  description: 'Run Xcode test suite',
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
      destination: {
        type: 'string',
        description: 'Test destination, e.g. "platform=iOS Simulator,name=iPhone 15"',
      },
      test_plan: {
        type: 'string',
        description: 'Test plan name',
      },
      only_testing: {
        type: 'array',
        items: { type: 'string' },
        description: 'Run only specific tests',
      },
    },
    required: ['scheme'],
  },
};

export async function xcodeTest(params: TestParams): Promise<ToolResult<TestResultData>> {
  try {
    // Validation
    if (!params.scheme) {
      return {
        success: false,
        error: 'Scheme required',
        operation: 'test',
      };
    }

    // Find project if not specified
    const projectPath = params.project_path || (await findXcodeProject());
    if (!projectPath) {
      return {
        success: false,
        error: 'No Xcode project found in current directory',
        operation: 'test',
      };
    }

    // Build command args
    const args = ['-scheme', params.scheme];

    if (projectPath.endsWith('.xcworkspace')) {
      args.unshift('-workspace', projectPath);
    } else {
      args.unshift('-project', projectPath);
    }

    if (params.destination) {
      args.push('-destination', params.destination);
    }

    if (params.test_plan) {
      args.push('-testPlan', params.test_plan);
    }

    if (params.only_testing) {
      params.only_testing.forEach((test) => {
        args.push('-only-testing', test);
      });
    }

    args.push('test');

    // Execute tests
    logger.info(`Running tests: ${params.scheme}`);
    const startTime = Date.now();
    const result = await runCommand('xcodebuild', args);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Parse test results
    const output = result.stdout;
    const passedMatch = output.match(/Test Suite .* passed at .*/);
    const failedMatch = output.match(/(\d+) tests?, (\d+) failures?/);

    const data: TestResultData = {
      message: passedMatch
        ? `Tests passed in ${duration}s`
        : failedMatch
          ? `${failedMatch[1]} tests, ${failedMatch[2]} failures`
          : `Tests completed in ${duration}s`,
      passed: failedMatch ? parseInt(failedMatch[1]) - parseInt(failedMatch[2]) : undefined,
      failed: failedMatch ? parseInt(failedMatch[2]) : undefined,
      duration,
    };

    return {
      success: result.code === 0,
      data,
      summary: `Tests ${result.code === 0 ? 'passed' : 'failed'}`,
    };
  } catch (error) {
    logger.error('Test execution failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'test',
    };
  }
}
