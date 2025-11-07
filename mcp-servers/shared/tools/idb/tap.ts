/**
 * IDB Tap Tool
 *
 * Tap at coordinates (use after describe to get coordinates)
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { TapParams, TapResultData } from '../../types/idb.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';

export const idbTapDefinition: ToolDefinition = {
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

export async function idbTap(params: TapParams): Promise<ToolResult<TapResultData>> {
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
    const duration = params.duration || 0.1;

    // Execute tap command
    logger.info(`Tapping at (${params.x}, ${params.y})`);
    const result = await runCommand('idb', [
      'ui',
      'tap',
      String(Math.round(params.x)),
      String(Math.round(params.y)),
      '--target',
      target,
      '--duration',
      String(duration),
    ]);

    const data: TapResultData = {
      message: 'Tap executed successfully',
      coordinates: { x: params.x, y: params.y },
      note: 'UI interaction complete',
    };

    if (result.code === 0) {
      return {
        success: true as const,
        data,
        summary: `Tapped (${params.x}, ${params.y})`,
      };
    } else {
      return {
        success: false as const,
        error: 'Tap failed',
        details: result.stderr,
      };
    }
  } catch (error) {
    logger.error('Tap failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'tap',
    };
  }
}
