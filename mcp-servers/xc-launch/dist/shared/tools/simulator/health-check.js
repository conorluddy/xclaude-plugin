/**
 * Simulator Health Check Tool
 *
 * Validate iOS development environment
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const simulatorHealthCheckDefinition = {
    name: 'simulator_health_check',
    description: 'Validate iOS development environment',
    inputSchema: {
        type: 'object',
        properties: {},
    },
};
export async function simulatorHealthCheck(_params) {
    try {
        logger.info('Checking environment health');
        const issues = [];
        // Check Xcode
        let xcodeInstalled = false;
        try {
            await runCommand('xcodebuild', ['-version']);
            xcodeInstalled = true;
        }
        catch {
            issues.push('Xcode not installed or xcodebuild not in PATH');
        }
        // Check simctl
        let simctlAvailable = false;
        try {
            await runCommand('xcrun', ['simctl', 'help']);
            simctlAvailable = true;
        }
        catch {
            issues.push('simctl not available');
        }
        const data = {
            xcode_installed: xcodeInstalled,
            simctl_available: simctlAvailable,
            issues,
            message: issues.length === 0 ? 'Environment healthy' : `${issues.length} issues detected`,
        };
        if (issues.length === 0) {
            return {
                success: true,
                data,
                summary: 'Healthy',
            };
        }
        else {
            return {
                success: false,
                error: `${issues.length} issues detected`,
                details: issues.join(', '),
            };
        }
    }
    catch (error) {
        logger.error('Health check failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'health-check',
        };
    }
}
