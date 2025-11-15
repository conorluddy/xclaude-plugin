/**
 * Simulator Screenshot Tool
 *
 * Capture simulator screenshot
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const simulatorScreenshotDefinition = {
    name: 'simulator_screenshot',
    description: 'Capture simulator screenshot',
    inputSchema: {
        type: 'object',
        properties: {
            device_id: {
                type: 'string',
                description: 'Device UDID or "booted" for active simulator',
            },
            output_path: {
                type: 'string',
                description: 'Output file path (default: auto-generated)',
            },
        },
    },
};
export async function simulatorScreenshot(params) {
    try {
        const deviceId = params.device_id || 'booted';
        const outputPath = params.output_path || `/tmp/screenshot-${Date.now()}.png`;
        // Execute screenshot command
        logger.info(`Capturing screenshot from ${deviceId}`);
        const result = await runCommand('xcrun', ['simctl', 'io', deviceId, 'screenshot', outputPath]);
        const data = {
            message: 'Screenshot captured successfully',
            output_path: outputPath,
            note: `Saved to ${outputPath}`,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'Screenshot captured',
            };
        }
        else {
            return {
                success: false,
                error: 'Screenshot capture failed',
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger.error('Screenshot failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'screenshot',
        };
    }
}
