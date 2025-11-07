/**
 * Simulator Terminate App Tool
 *
 * Terminate a running app
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const simulatorTerminateAppDefinition = {
    name: 'simulator_terminate_app',
    description: 'Terminate a running app on simulator',
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
export async function simulatorTerminateApp(params) {
    try {
        if (!params.app_identifier) {
            return {
                success: false,
                error: 'app_identifier required',
                operation: 'terminate-app',
            };
        }
        const deviceId = params.device_id || 'booted';
        logger.info(`Terminating app ${params.app_identifier} on ${deviceId}`);
        const result = await runCommand('xcrun', ['simctl', 'terminate', deviceId, params.app_identifier]);
        const data = {
            message: 'App terminated successfully',
            app_identifier: params.app_identifier,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'App terminated',
            };
        }
        else {
            return {
                success: false,
                error: "Operation failed",
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger.error('Terminate app failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'terminate-app',
        };
    }
}
//# sourceMappingURL=terminate-app.js.map