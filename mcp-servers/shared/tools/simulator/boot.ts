/**
 * Simulator Boot Tool
 *
 * Boot a simulator device
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { DeviceLifecycleParams, DeviceLifecycleResultData } from '../../types/simulator.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const simulatorBootDefinition: ToolDefinition = {
  name: 'simulator_boot',
  description: 'Boot a simulator device',
  inputSchema: {
    type: 'object',
    properties: {
      device_id: {
        type: 'string',
        description: 'Device UDID or name (e.g. "iPhone 15" or full UDID)',
      },
    },
    required: ['device_id'],
  },
};

export async function simulatorBoot(
  params: DeviceLifecycleParams
): Promise<ToolResult<DeviceLifecycleResultData>> {
  try {
    // Validation
    if (!params.device_id) {
      return {
        success: false,
        error: 'device_id required',
        operation: 'boot',
      };
    }

    // Execute boot command
    logger.info(`Booting simulator: ${params.device_id}`);
    const result = await runCommand('xcrun', ['simctl', 'boot', params.device_id]);

    const data: DeviceLifecycleResultData = {
      message: `Device booted successfully`,
      device_id: params.device_id,
      note: 'Device is starting up',
    };

    return {
      success: result.code === 0,
      data,
      summary: 'Device booted',
    };
  } catch (error) {
    logger.error('Boot failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'boot',
    };
  }
}
