/**
 * Simulator Install App Tool
 *
 * Install an app on simulator
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const simulatorInstallAppDefinition = {
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
export async function simulatorInstallApp(params) {
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
        const data = {
            message: 'App installed successfully',
            app_identifier: params.app_identifier,
            note: `Installed on ${deviceId}`,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'App installed',
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
        logger.error('Install app failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'install-app',
        };
    }
}
//# sourceMappingURL=install-app.js.map