/**
 * IDB Tap Tool
 *
 * Tap at coordinates (use after describe to get coordinates)
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
import { resolveSimulatorTarget } from '../../utils/simulator.js';
export const idbTapDefinition = {
    name: 'idb_tap',
    description: 'Tap at UI coordinates',
    inputSchema: {
        type: 'object',
        properties: {
            target: {
                type: 'string',
                description: 'Target device (default: "booted")',
            },
            x: {
                type: 'number',
                description: 'X coordinate',
            },
            y: {
                type: 'number',
                description: 'Y coordinate',
            },
            duration: {
                type: 'number',
                description: 'Tap duration in seconds (default: 0.1)',
            },
        },
        required: ['x', 'y'],
    },
};
export async function idbTap(params) {
    try {
        // Validation
        if (params.x === undefined || params.y === undefined) {
            return {
                success: false,
                error: 'x and y coordinates required',
                operation: 'tap',
            };
        }
        const target = params.target || 'booted';
        const resolvedTarget = await resolveSimulatorTarget(target);
        const duration = params.duration || 0.1;
        // Execute tap command
        logger.info(`Tapping at (${params.x}, ${params.y})`);
        const result = await runCommand('idb', [
            'ui',
            'tap',
            String(Math.round(params.x)),
            String(Math.round(params.y)),
            '--udid',
            resolvedTarget,
            '--duration',
            String(duration),
        ]);
        const data = {
            message: 'Tap executed successfully',
            coordinates: { x: params.x, y: params.y },
            note: 'UI interaction complete',
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: `Tapped (${params.x}, ${params.y})`,
            };
        }
        else {
            return {
                success: false,
                error: 'Tap failed',
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger.error('Tap failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'tap',
        };
    }
}
