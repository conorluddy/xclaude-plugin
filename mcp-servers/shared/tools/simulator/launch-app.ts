/**
 * Simulator Launch App Tool
 *
 * Launch an app on simulator
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { AppLifecycleParams, AppLifecycleResultData } from '../../types/simulator.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const simulatorLaunchAppDefinition: ToolDefinition = {
  name: 'simulator_launch_app',
  description: 'Launch app on simulator',
  inputSchema: {
    type: 'object',
    properties: {
      device_id: {
        type: 'string',
        description: 'Device UDID or "booted" for active simulator',
      },
      app_identifier: {
        type: 'string',
        description: 'App bundle identifier (e.g. "com.example.MyApp")',
      },
    },
    required: ['app_identifier'],
  },
};

export async function simulatorLaunchApp(
  params: AppLifecycleParams
): Promise<ToolResult<AppLifecycleResultData>> {
  try {
    // Validation
    if (!params.app_identifier) {
      return {
        success: false,
        error: 'app_identifier required',
        operation: 'launch-app',
      };
    }

    const deviceId = params.device_id || 'booted';

    // Execute launch command
    logger.info(`Launching app ${params.app_identifier} on ${deviceId}`);
    const result = await runCommand('xcrun', ['simctl', 'launch', deviceId, params.app_identifier]);

    // Parse PID from output if available
    const pidMatch = result.stdout.match(/(\d+)/);
    const pid = pidMatch ? parseInt(pidMatch[1]) : undefined;

    const data: AppLifecycleResultData = {
      message: 'App launched successfully',
      app_identifier: params.app_identifier,
      pid,
      note: pid ? `Process ID: ${pid}` : undefined,
    };

    if (result.code === 0) {
      return {
        success: true as const,
        data,
        summary: 'App launched',
      };
    } else {
      return {
        success: false as const,
        error: "Operation failed",
        details: result.stderr,
      };
    }
  } catch (error) {
    logger.error('Launch app failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'launch-app',
    };
  }
}
