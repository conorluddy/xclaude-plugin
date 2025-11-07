/**
 * Simulator Get App Container Tool
 *
 * Get filesystem path to app container
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const simulatorGetAppContainerDefinition = {
    name: 'simulator_get_app_container',
    description: 'Get app container filesystem path',
    inputSchema: {
        type: 'object',
        properties: {
            device_id: {
                type: 'string',
                description: 'Device UDID or "booted" for active simulator',
            },
            app_identifier: {
                type: 'string',
                description: 'App bundle identifier',
            },
            container_type: {
                type: 'string',
                enum: ['data', 'bundle', 'group'],
                description: 'Container type (default: data)',
            },
        },
        required: ['app_identifier'],
    },
};
export async function simulatorGetAppContainer(params) {
    try {
        if (!params.app_identifier) {
            return {
                success: false,
                error: 'app_identifier required',
                operation: 'get-app-container',
            };
        }
        const deviceId = params.device_id || 'booted';
        const containerType = params.container_type || 'data';
        logger.info(`Getting ${containerType} container for ${params.app_identifier}`);
        const result = await runCommand('xcrun', [
            'simctl',
            'get_app_container',
            deviceId,
            params.app_identifier,
            containerType,
        ]);
        const containerPath = result.stdout.trim();
        const data = {
            message: 'Container path retrieved',
            output_path: containerPath,
            note: `${containerType} container: ${containerPath}`,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'Path retrieved',
            };
        }
        else {
            return {
                success: false,
                error: 'Failed to retrieve container path',
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger.error('Get app container failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'get-app-container',
        };
    }
}
//# sourceMappingURL=get-app-container.js.map