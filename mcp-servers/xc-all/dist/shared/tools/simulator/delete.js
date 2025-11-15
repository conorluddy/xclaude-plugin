/**
 * Simulator Delete Tool
 *
 * Delete a simulator device
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const simulatorDeleteDefinition = {
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
export async function simulatorDelete(params) {
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
        const data = {
            message: 'Device deleted successfully',
            device_id: params.device_id,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'Device deleted',
            };
        }
        else {
            return {
                success: false,
                error: 'Delete failed',
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger.error('Delete failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'delete',
        };
    }
}
