/**
 * Simulator Delete Tool
 *
 * Delete a simulator device
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { DeviceLifecycleParams, DeviceLifecycleResultData } from '../../types/simulator.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const simulatorDeleteDefinition: ToolDefinition = {
  name: 'simulator_delete',
  description: 'Delete a simulator device',
  inputSchema: {
    type: 'object',
    properties: {
      device_id: {
        type: 'string',
        description: 'Device UDID to delete',
      },
    },
    required: ['device_id'],
  },
};

export async function simulatorDelete(
  params: DeviceLifecycleParams
): Promise<ToolResult<DeviceLifecycleResultData>> {
  try {
    if (!params.device_id) {
      return {
        success: false,
        error: 'device_id required',
        operation: 'delete',
      };
    }

    logger.info(`Deleting simulator: ${params.device_id}`);
    const result = await runCommand('xcrun', ['simctl', 'delete', params.device_id]);

    const data: DeviceLifecycleResultData = {
      message: 'Device deleted successfully',
      device_id: params.device_id,
    };

    if (result.code === 0) {
      return {
        success: true as const,
        data,
        summary: 'Device deleted',
      };
    } else {
      return {
        success: false as const,
        error: 'Delete failed',
        details: result.stderr,
      };
    }
  } catch (error) {
    logger.error('Delete failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'delete',
    };
  }
}
