/**
 * Simulator Create Tool
 *
 * Create a new simulator device
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const simulatorCreateDefinition = {
    name: 'simulator_create',
    description: 'Create a new simulator device',
    inputSchema: {
        type: 'object',
        properties: {
            device_name: {
                type: 'string',
                description: 'Name for the new device',
            },
            device_type: {
                type: 'string',
                description: 'Device type (e.g. "iPhone 15 Pro")',
            },
            runtime: {
                type: 'string',
                description: 'iOS runtime (e.g. "iOS-17-2")',
            },
        },
        required: ['device_name', 'device_type', 'runtime'],
    },
};
export async function simulatorCreate(params) {
    try {
        if (!params.device_name || !params.device_type || !params.runtime) {
            return {
                success: false,
                error: 'device_name, device_type, and runtime required',
                operation: 'create',
            };
        }
        logger.info(`Creating simulator: ${params.device_name}`);
        const result = await runCommand('xcrun', [
            'simctl',
            'create',
            params.device_name,
            params.device_type,
            params.runtime,
        ]);
        // Output is the new device UDID
        const deviceId = result.stdout.trim();
        const data = {
            message: 'Device created successfully',
            device_id: deviceId,
            device_name: params.device_name,
            note: `UDID: ${deviceId}`,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'Device created',
            };
        }
        else {
            return {
                success: false,
                error: 'Create failed',
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger.error('Create failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'create',
        };
    }
}
//# sourceMappingURL=create.js.map