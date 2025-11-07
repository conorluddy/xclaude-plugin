/**
 * IDB Gesture Tool
 *
 * Perform swipes and hardware button presses
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const idbGestureDefinition = {
    name: 'idb_gesture',
    description: 'Perform swipe gestures or hardware button presses',
    inputSchema: {
        type: 'object',
        properties: {
            target: {
                type: 'string',
                description: 'Target device (default: "booted")',
            },
            gesture_type: {
                type: 'string',
                enum: ['swipe', 'button'],
                description: 'Type of gesture',
            },
            start_x: {
                type: 'number',
                description: 'Start X coordinate (for swipe)',
            },
            start_y: {
                type: 'number',
                description: 'Start Y coordinate (for swipe)',
            },
            end_x: {
                type: 'number',
                description: 'End X coordinate (for swipe)',
            },
            end_y: {
                type: 'number',
                description: 'End Y coordinate (for swipe)',
            },
            duration: {
                type: 'number',
                description: 'Swipe duration in milliseconds (default: 200)',
            },
            button_type: {
                type: 'string',
                enum: ['HOME', 'LOCK', 'SIDE_BUTTON', 'SIRI'],
                description: 'Hardware button to press',
            },
        },
        required: ['gesture_type'],
    },
};
export async function idbGesture(params) {
    try {
        const target = params.target || 'booted';
        if (params.gesture_type === 'swipe') {
            // Validate swipe coordinates
            if (params.start_x === undefined ||
                params.start_y === undefined ||
                params.end_x === undefined ||
                params.end_y === undefined) {
                return {
                    success: false,
                    error: 'start_x, start_y, end_x, end_y required for swipe',
                    operation: 'gesture',
                };
            }
            const duration = params.duration || 200;
            logger.info(`Swiping from (${params.start_x}, ${params.start_y}) to (${params.end_x}, ${params.end_y})`);
            const result = await runCommand('idb', [
                'ui',
                'swipe',
                String(Math.round(params.start_x)),
                String(Math.round(params.start_y)),
                String(Math.round(params.end_x)),
                String(Math.round(params.end_y)),
                '--target',
                target,
                '--duration',
                String(duration),
            ]);
            const data = {
                message: 'Swipe gesture executed',
                note: `From (${params.start_x}, ${params.start_y}) to (${params.end_x}, ${params.end_y})`,
            };
            if (result.code === 0) {
                return {
                    success: true,
                    data,
                    summary: 'Swipe complete',
                };
            }
            else {
                return {
                    success: false,
                    error: 'Swipe gesture failed',
                    details: result.stderr,
                };
            }
        }
        else if (params.gesture_type === 'button') {
            // Validate button type
            if (!params.button_type) {
                return {
                    success: false,
                    error: 'button_type required for button gesture',
                    operation: 'gesture',
                };
            }
            logger.info(`Pressing button: ${params.button_type}`);
            const result = await runCommand('idb', [
                'ui',
                'button',
                params.button_type,
                '--target',
                target,
            ]);
            const data = {
                message: 'Button press executed',
                note: `Pressed: ${params.button_type}`,
            };
            if (result.code === 0) {
                return {
                    success: true,
                    data,
                    summary: 'Button pressed',
                };
            }
            else {
                return {
                    success: false,
                    error: 'Button press failed',
                    details: result.stderr,
                };
            }
        }
        else {
            return {
                success: false,
                error: 'Invalid gesture_type',
                operation: 'gesture',
            };
        }
    }
    catch (error) {
        logger.error('Gesture failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'gesture',
        };
    }
}
//# sourceMappingURL=gesture.js.map