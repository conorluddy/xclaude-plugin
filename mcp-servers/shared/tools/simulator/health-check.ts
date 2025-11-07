/**
 * Simulator Health Check Tool
 *
 * Validate iOS development environment
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { HealthCheckParams, HealthCheckResultData } from '../../types/simulator.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const simulatorHealthCheckDefinition: ToolDefinition = {
  name: 'simulator_health_check',
  description: 'Validate iOS development environment',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function simulatorHealthCheck(
  _params: HealthCheckParams
): Promise<ToolResult<HealthCheckResultData>> {
  try {
    logger.info('Checking environment health');
    const issues: string[] = [];

    // Check Xcode
    let xcodeInstalled = false;
    try {
      await runCommand('xcodebuild', ['-version']);
      xcodeInstalled = true;
    } catch {
      issues.push('Xcode not installed or xcodebuild not in PATH');
    }

    // Check simctl
    let simctlAvailable = false;
    try {
      await runCommand('xcrun', ['simctl', 'help']);
      simctlAvailable = true;
    } catch {
      issues.push('simctl not available');
    }

    const data: HealthCheckResultData = {
      xcode_installed: xcodeInstalled,
      simctl_available: simctlAvailable,
      issues,
      message: issues.length === 0 ? 'Environment healthy' : `${issues.length} issues detected`,
    };

    return {
      success: issues.length === 0,
      data,
      summary: issues.length === 0 ? 'Healthy' : `${issues.length} issues`,
    };
  } catch (error) {
    logger.error('Health check failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'health-check',
    };
  }
}
