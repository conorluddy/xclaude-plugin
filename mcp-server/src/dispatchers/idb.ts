/**
 * IDB Dispatcher
 *
 * Consolidates all IDB (iOS Development Bridge) operations into a single tool.
 * Token cost: ~400 tokens (vs ~6k for 10 separate tools)
 *
 * Operations: tap, input, gesture, describe, find-element, app, list-apps, check-accessibility
 *
 * Accessibility-First Strategy:
 * 1. Use describe (fast, 50 tokens) to query accessibility tree
 * 2. Find elements via accessibility data
 * 3. Only fallback to screenshots if accessibility insufficient
 */

import { BaseDispatcher } from './base.js';
import { logger } from '../utils/logger.js';
import type {
  ToolDefinition,
  IDBOperationArgs,
  IDBResultData,
  OperationResult,
  TapParams,
  InputParams,
  GestureParams,
  DescribeParams,
  FindElementParams,
  IDBAppParams,
  ListAppsParams,
  CheckAccessibilityParams,
  TargetsParams,
  IDBOperationResultData,
} from '../types.js';

export class IDBDispatcher extends BaseDispatcher<IDBOperationArgs, IDBResultData> {
  getToolDefinition(): ToolDefinition {
    return {
      name: 'execute_idb_command',
      description:
        'iOS UI automation via IDB with accessibility-first approach. Use ui-automation-workflows Skill for element finding and interaction patterns.',
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: [
              'tap',
              'input',
              'gesture',
              'describe',
              'find-element',
              'app',
              'list-apps',
              'check-accessibility',
              'targets',
            ],
            description:
              'Operation: tap (tap coordinates), input (type text/keys), gesture (swipe/button), describe (get accessibility tree), find-element (search by label), app (manage apps), list-apps (show installed), check-accessibility (assess quality), targets (manage IDB connections)',
          },
          target: {
            type: 'string',
            description: 'Target device UDID or "booted" for active simulator',
          },
          parameters: {
            type: 'object',
            description:
              'Operation-specific parameters: x/y coordinates, text input, element query, app bundle ID, gesture type, etc.',
          },
        },
        required: ['operation'],
      },
    };
  }

  async execute(args: IDBOperationArgs): Promise<OperationResult<IDBResultData>> {
    const { operation, target, parameters } = args;

    logger.info(`Executing IDB operation: ${operation}`);

    try {
      switch (operation) {
        case 'tap':
          if (!parameters?.x || !parameters?.y) {
            return this.formatError('x and y coordinates required for tap', operation);
          }
          return await this.executeTap({
            target,
            parameters: { x: parameters.x, y: parameters.y, duration: parameters.duration },
          });

        case 'input':
          if (!parameters) {
            return this.formatError('parameters required for input', operation);
          }
          return await this.executeInput({ target, parameters });

        case 'gesture':
          if (!parameters?.gesture_type) {
            return this.formatError('gesture_type required in parameters', operation);
          }
          return await this.executeGesture({
            target,
            parameters: {
              gesture_type: parameters.gesture_type,
              direction: parameters.direction,
              button: parameters.button,
            },
          });

        case 'describe':
          return await this.executeDescribe({ target, parameters });

        case 'find-element':
          if (!parameters?.query) {
            return this.formatError('query required in parameters for find-element', operation);
          }
          return await this.executeFindElement({ target, parameters: { query: parameters.query } });

        case 'app':
          if (!parameters?.sub_operation) {
            return this.formatError('sub_operation required in parameters for app', operation);
          }
          return await this.executeApp({
            target,
            parameters: {
              sub_operation: parameters.sub_operation,
              bundle_id: parameters.bundle_id,
              app_path: parameters.app_path,
            },
          });

        case 'list-apps':
          return await this.executeListApps({
            target,
            parameters: { filter_type: parameters?.filter_type },
          });

        case 'check-accessibility':
          return await this.executeCheckAccessibility({ target });

        case 'targets':
          return await this.executeTargets({ parameters });

        default:
          return this.formatError(`Unknown operation: ${operation}`, operation);
      }
    } catch (error) {
      logger.error(`IDB operation failed: ${operation}`, error as Error);
      return this.formatError(error as Error, operation);
    }
  }

  private async executeTap(params: Partial<TapParams>): Promise<OperationResult<IDBResultData>> {
    try {
      const { runCommand } = await import('../utils/command.js');

      if (!params.parameters?.x || !params.parameters?.y) {
        return this.formatError('x and y coordinates required', 'tap');
      }

      const target = params.target || 'booted';
      const x = params.parameters.x;
      const y = params.parameters.y;
      const duration = params.parameters.duration || 0.1;

      // Execute idb ui tap
      await runCommand('idb', [
        '--udid',
        target,
        'ui',
        'tap',
        `${x}`,
        `${y}`,
        '--duration',
        `${duration}`,
      ]);

      const data: IDBOperationResultData = {
        message: `Tapped at coordinates (${x}, ${y})`,
        params: { x, y, duration },
      };

      return this.formatSuccess(data);
    } catch (error) {
      logger.error('Tap operation failed', error as Error);
      return this.formatError(error as Error, 'tap');
    }
  }

  private async executeInput(
    params: Partial<InputParams>
  ): Promise<OperationResult<IDBResultData>> {
    // Placeholder
    const data: IDBOperationResultData = {
      message: 'Input operation not yet implemented',
      note: 'Will support text, key, and key-sequence operations',
      params: params.parameters,
    };
    return this.formatSuccess(data);
  }

  private async executeGesture(
    params: Partial<GestureParams>
  ): Promise<OperationResult<IDBResultData>> {
    // Placeholder
    const data: IDBOperationResultData = {
      message: 'Gesture operation not yet implemented',
      note: 'Will support swipe and button operations (HOME, LOCK, etc.)',
      params: params.parameters,
    };
    return this.formatSuccess(data);
  }

  private async executeDescribe(
    params: Partial<DescribeParams>
  ): Promise<OperationResult<IDBResultData>> {
    try {
      const { runCommand } = await import('../utils/command.js');
      const target = params.target || 'booted';
      const operation = params.parameters?.operation || 'all';

      // Execute idb ui describe-all (or describe-point for specific coordinates)
      const args = ['ui'];
      if (operation === 'point' && params.parameters?.x && params.parameters?.y) {
        args.push('describe-point', `${params.parameters.x}`, `${params.parameters.y}`);
      } else {
        args.push('describe-all');
      }

      args.unshift('--udid', target);

      const result = await runCommand('idb', args);
      const elements = JSON.parse(result.stdout);

      const data: IDBOperationResultData = {
        message: `Retrieved accessibility tree with ${Array.isArray(elements) ? elements.length : 'unknown'} elements`,
        note: 'Accessibility-first: Use this data to find elements before taking screenshots',
        accessibility_priority: 'HIGH - 3-4x faster than screenshots',
        params: { elements },
      };

      return this.formatSuccess(data);
    } catch (error) {
      logger.error('Describe operation failed', error as Error);
      return this.formatError(error as Error, 'describe');
    }
  }

  private async executeFindElement(
    params: Partial<FindElementParams>
  ): Promise<OperationResult<IDBResultData>> {
    try {
      const { runCommand } = await import('../utils/command.js');

      if (!params.parameters?.query) {
        return this.formatError('query required', 'find-element');
      }

      const target = params.target || 'booted';
      const query = params.parameters.query;

      // First, get the full accessibility tree
      const describeResult = await runCommand('idb', ['--udid', target, 'ui', 'describe-all']);

      const elements = JSON.parse(describeResult.stdout);

      // Search for matching elements
      const matches = Array.isArray(elements)
        ? elements.filter((el: { label?: string; value?: string }) => {
            const label = el.label?.toLowerCase() || '';
            const value = el.value?.toLowerCase() || '';
            const queryLower = query.toLowerCase();
            return label.includes(queryLower) || value.includes(queryLower);
          })
        : [];

      const data: IDBOperationResultData = {
        message: `Found ${matches.length} element(s) matching "${query}"`,
        note:
          matches.length > 0
            ? 'Use centerX/centerY from results for tap coordinates'
            : 'No matches found - try a different query or use full describe',
        params: { query, matches },
      };

      return this.formatSuccess(data);
    } catch (error) {
      logger.error('Find element operation failed', error as Error);
      return this.formatError(error as Error, 'find-element');
    }
  }

  private async executeApp(params: Partial<IDBAppParams>): Promise<OperationResult<IDBResultData>> {
    // Placeholder
    const data: IDBOperationResultData = {
      message: 'App operation not yet implemented',
      note: 'Will support install, uninstall, launch, terminate via IDB',
      params: params.parameters,
    };
    return this.formatSuccess(data);
  }

  private async executeListApps(
    params: Partial<ListAppsParams>
  ): Promise<OperationResult<IDBResultData>> {
    try {
      const { runCommand } = await import('../utils/command.js');
      const target = params.target || 'booted';

      // Execute idb list-apps
      const args = ['--udid', target, 'list-apps'];

      // Add filter if specified
      if (params.parameters?.filter_type) {
        args.push(`--${params.parameters.filter_type}`);
      }

      const result = await runCommand('idb', args);
      const apps = JSON.parse(result.stdout);

      const appCount = Array.isArray(apps) ? apps.length : 0;
      const filterNote = params.parameters?.filter_type
        ? ` (filtered: ${params.parameters.filter_type})`
        : '';

      const data: IDBOperationResultData = {
        message: `Found ${appCount} installed app(s)${filterNote}`,
        params: { apps, filter_type: params.parameters?.filter_type },
      };

      return this.formatSuccess(data);
    } catch (error) {
      logger.error('List apps operation failed', error as Error);
      return this.formatError(error as Error, 'list-apps');
    }
  }

  private async executeCheckAccessibility(
    _params: Partial<CheckAccessibilityParams>
  ): Promise<OperationResult<IDBResultData>> {
    try {
      const { runCommand } = await import('../utils/command.js');
      const target = _params.target || 'booted';

      // Get accessibility tree
      const result = await runCommand('idb', ['--udid', target, 'ui', 'describe-all']);

      const elements = JSON.parse(result.stdout);

      // Analyze accessibility quality
      let score = 0;
      let elementsWithLabels = 0;
      let interactiveElements = 0;

      if (Array.isArray(elements)) {
        elementsWithLabels = elements.filter((el) => el.label && el.label.trim()).length;
        interactiveElements = elements.filter(
          (el) => el.type === 'Button' || el.type === 'TextField' || el.isEnabled
        ).length;

        // Calculate quality score (0-100)
        const totalElements = elements.length;
        if (totalElements > 0) {
          const labelPercentage = (elementsWithLabels / totalElements) * 100;
          const interactivePercentage = (interactiveElements / totalElements) * 50;
          score = Math.min(100, labelPercentage * 0.7 + interactivePercentage * 0.3);
        }
      }

      // Determine recommendation
      let recommendation: string;
      if (score >= 70) {
        recommendation = 'HIGH - Use accessibility tree (3-4x faster, 80% cheaper)';
      } else if (score >= 40) {
        recommendation = 'MEDIUM - Try accessibility first, fallback to screenshot if needed';
      } else {
        recommendation = 'LOW - Consider screenshot for this screen (accessibility data minimal)';
      }

      const data: IDBOperationResultData = {
        message: `Accessibility quality: ${Math.round(score)}/100`,
        note: `${elementsWithLabels}/${Array.isArray(elements) ? elements.length : 0} elements have labels`,
        accessibility_priority: recommendation,
        guidance:
          score >= 70
            ? 'Proceed with accessibility-first workflow'
            : score >= 40
              ? 'Try find-element first, use screenshot as backup'
              : 'Screenshot may be more reliable for this screen',
        params: {
          score: Math.round(score),
          total_elements: Array.isArray(elements) ? elements.length : 0,
          labeled_elements: elementsWithLabels,
          interactive_elements: interactiveElements,
        },
      };

      return this.formatSuccess(data);
    } catch (error) {
      logger.error('Accessibility check failed', error as Error);
      return this.formatError(error as Error, 'check-accessibility');
    }
  }

  private async executeTargets(
    params: Partial<TargetsParams>
  ): Promise<OperationResult<IDBResultData>> {
    // Placeholder
    const data: IDBOperationResultData = {
      message: 'Targets operation not yet implemented',
      note: 'Will manage IDB target connections (list, describe, connect, disconnect)',
      params: params.parameters,
    };
    return this.formatSuccess(data);
  }
}
