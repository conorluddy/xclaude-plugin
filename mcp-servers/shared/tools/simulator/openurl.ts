/**
 * Simulator Open URL Tool
 *
 * Open URL or deep link in simulator
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { OpenURLParams, AppLifecycleResultData } from '../../types/simulator.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const simulatorOpenURLDefinition: ToolDefinition = {
  name: 'simulator_openurl',
  description: 'Open URL or deep link in simulator',
  inputSchema: {
    type: 'object',
    properties: {
      device_id: {
        type: 'string',
        description: 'Device UDID or "booted" for active simulator',
      },
      url: {
        type: 'string',
        description: 'URL to open (http://, https://, or custom scheme)',
      },
    },
    required: ['url'],
  },
};

export async function simulatorOpenURL(
  params: OpenURLParams
): Promise<ToolResult<AppLifecycleResultData>> {
  try {
    if (!params.url) {
      return {
        success: false,
        error: 'url required',
        operation: 'openurl',
      };
    }

    const deviceId = params.device_id || 'booted';

    logger.info(`Opening URL on ${deviceId}: ${params.url}`);
    const result = await runCommand('xcrun', ['simctl', 'openurl', deviceId, params.url]);

    const data: AppLifecycleResultData = {
      message: 'URL opened successfully',
      app_identifier: '', // Not applicable
      note: `Opened: ${params.url}`,
    };

    if (result.code === 0) {
      return {
        success: true as const,
        data,
        summary: 'URL opened',
      };
    } else {
      return {
        success: false as const,
        error: "Operation failed",
        details: result.stderr,
      };
    }
  } catch (error) {
    logger.error('Open URL failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'openurl',
    };
  }
}
