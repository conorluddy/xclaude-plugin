/**
 * Simulator Shutdown Tool
 *
 * Shutdown a running simulator
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { DeviceLifecycleParams, DeviceLifecycleResultData } from '../../types/simulator.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const simulatorShutdownDefinition: ToolDefinition = {
  name: 'simulator_shutdown',
  description: 'Shutdown a running simulator',
  inputSchema: {
    type: 'object',
    properties: {
      device_id: {
        type: 'string',
        description: 'Device UDID or "booted" for active simulator',
      },
    },
    required: ['device_id'],
  },
};

export async function simulatorShutdown(
  params: DeviceLifecycleParams
): Promise<ToolResult<DeviceLifecycleResultData>> {
  try {
    if (!params.device_id) {
      return {
        success: false,
        error: 'device_id required',
        operation: 'shutdown',
      };
    }

    logger.info(`Shutting down simulator: ${params.device_id}`);
    const result = await runCommand('xcrun', ['simctl', 'shutdown', params.device_id]);

    const data: DeviceLifecycleResultData = {
      message: 'Device shut down successfully',
      device_id: params.device_id,
    };

    if (result.code === 0) {
      return {
        success: true as const,
        data,
        summary: 'Device shut down',
      };
    } else {
      return {
        success: false as const,
        error: 'Shutdown failed',
        details: result.stderr,
      };
    }
  } catch (error) {
    logger.error('Shutdown failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'shutdown',
    };
  }
}
