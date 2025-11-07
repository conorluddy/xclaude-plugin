/**
 * Simulator Install App Tool
 *
 * Install an app on simulator
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { AppLifecycleParams, AppLifecycleResultData } from '../../types/simulator.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const simulatorInstallAppDefinition: ToolDefinition = {
  name: 'simulator_install_app',
  description: 'Install app on simulator',
  inputSchema: {
    type: 'object',
    properties: {
      device_id: {
        type: 'string',
        description: 'Device UDID or "booted" for active simulator',
      },
      app_path: {
        type: 'string',
        description: 'Path to .app bundle',
      },
    },
    required: ['app_path'],
  },
};

export async function simulatorInstallApp(
  params: AppLifecycleParams
): Promise<ToolResult<AppLifecycleResultData>> {
  try {
    // Validation
    if (!params.app_path) {
      return {
        success: false,
        error: 'app_path required',
        operation: 'install-app',
      };
    }

    const deviceId = params.device_id || 'booted';

    // Execute install command
    logger.info(`Installing app on ${deviceId}: ${params.app_path}`);
    const result = await runCommand('xcrun', ['simctl', 'install', deviceId, params.app_path]);

    const data: AppLifecycleResultData = {
      message: 'App installed successfully',
      app_identifier: params.app_identifier,
      note: `Installed on ${deviceId}`,
    };

    return {
      success: result.code === 0,
      data,
      summary: 'App installed',
    };
  } catch (error) {
    logger.error('Install app failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'install-app',
    };
  }
}
