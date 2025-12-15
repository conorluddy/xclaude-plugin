/**
 * IDB Input Tool
 *
 * Type text or press keys
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { InputParams, InputResultData } from '../../types/idb.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
import { resolveSimulatorTarget } from '../../utils/simulator.js';

export const idbInputDefinition: ToolDefinition = {
  name: 'idb_input',
  description: 'Type text or press keys in simulator',
  inputSchema: {
    type: 'object',
    properties: {
      target: {
        type: 'string',
        description: 'Target device (default: "booted")',
      },
      text: {
        type: 'string',
        description: 'Text to type',
      },
      key: {
        type: 'string',
        description: 'Single key to press (e.g. "return", "delete")',
      },
      key_sequence: {
        type: 'array',
        items: { type: 'string' },
        description: 'Sequence of keys to press',
      },
    },
  },
};

export async function idbInput(params: InputParams): Promise<ToolResult<InputResultData>> {
  try {
    // Validation
    if (!params.text && !params.key && !params.key_sequence) {
      return {
        success: false,
        error: 'Must provide text, key, or key_sequence',
        operation: 'input',
      };
    }

    const target = params.target || 'booted';
    const resolvedTarget = await resolveSimulatorTarget(target);
    let result;

    // Type text
    if (params.text) {
      logger.info(`Typing text: ${params.text}`);
      result = await runCommand('idb', ['ui', 'text', params.text, '--udid', resolvedTarget]);
    }
    // Press single key
    else if (params.key) {
      logger.info(`Pressing key: ${params.key}`);
      result = await runCommand('idb', ['ui', 'key', params.key, '--udid', resolvedTarget]);
    }
    // Press key sequence
    else if (params.key_sequence) {
      logger.info(`Pressing key sequence: ${params.key_sequence.join(', ')}`);
      result = await runCommand('idb', [
        'ui',
        'key-sequence',
        ...params.key_sequence,
        '--udid',
        resolvedTarget,
      ]);
    } else {
      return {
        success: false,
        error: 'Invalid input parameters',
        operation: 'input',
      };
    }

    const data: InputResultData = {
      message: 'Input executed successfully',
      note: params.text ? `Typed: ${params.text}` : `Key: ${params.key || params.key_sequence?.join(', ')}`,
    };

    if (result.code === 0) {
      return {
        success: true as const,
        data,
        summary: 'Input complete',
      };
    } else {
      return {
        success: false as const,
        error: 'Input failed',
        details: result.stderr,
      };
    }
  } catch (error) {
    logger.error('Input failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'input',
    };
  }
}
