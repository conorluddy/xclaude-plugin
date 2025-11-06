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
      const { executeCommand } = await import('../utils/command.js');

      if (!params.parameters?.x || !params.parameters?.y) {
        return this.formatError('x and y coordinates required', 'tap');
      }

      const target = params.target || 'booted';
      const x = params.parameters.x;
      const y = params.parameters.y;
      const duration = params.parameters.duration || 0.1;

      // Execute idb ui tap - CORRECT ordering: idb ui tap --udid UDID x y --duration dur
      // CRITICAL: Convert to integers - idb CLI rejects float coordinates like "143.5"
      const intX = Math.round(x);
      const intY = Math.round(y);
      const command = `idb ui tap --udid "${target}" ${intX} ${intY} --duration ${duration}`;
      logger.debug(`Executing tap: ${command}`);

      await executeCommand(command);

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

  /**
   * Input text and keyboard events to iOS apps
   * Supports: text input, single key presses, key sequences
   */
  private async executeInput(
    params: Partial<InputParams>
  ): Promise<OperationResult<IDBResultData>> {
    try {
      const { executeCommand } = await import('../utils/command.js');

      if (!params.parameters) {
        return this.formatError('parameters required for input', 'input');
      }

      const target = params.target || 'booted';
      const { text, key, key_sequence } = params.parameters;

      // Handle text input
      if (text) {
        const command = `idb ui text --udid "${target}" "${text}"`;
        await executeCommand(command);

        const data: IDBOperationResultData = {
          message: `Typed text: "${text}"`,
          note: 'Text input completed',
        };

        return this.formatSuccess(data);
      }

      // Handle single key press
      if (key) {
        const command = `idb ui key --udid "${target}" ${key}`;
        await executeCommand(command);

        const data: IDBOperationResultData = {
          message: `Pressed key: ${key}`,
          note: 'Key press completed',
        };

        return this.formatSuccess(data);
      }

      // Handle key sequence
      if (key_sequence && Array.isArray(key_sequence) && key_sequence.length > 0) {
        for (const keyName of key_sequence) {
          const command = `idb ui key --udid "${target}" ${keyName}`;
          await executeCommand(command);
        }

        const data: IDBOperationResultData = {
          message: `Pressed ${key_sequence.length} key(s) in sequence`,
          note: `Keys: ${key_sequence.join(', ')}`,
        };

        return this.formatSuccess(data);
      }

      return this.formatError('text, key, or key_sequence required in parameters', 'input');
    } catch (error) {
      logger.error('Input operation failed', error as Error);
      return this.formatError(error as Error, 'input');
    }
  }

  /**
   * Performs swipe gestures and hardware button presses
   * Swipe: Requires start/end coordinates and optional duration
   * Button: Supports HOME, LOCK, SIDE_BUTTON, SIRI
   */
  private async executeGesture(
    params: Partial<GestureParams>
  ): Promise<OperationResult<IDBResultData>> {
    try {
      const { executeCommand } = await import('../utils/command.js');

      if (!params.parameters?.gesture_type) {
        return this.formatError('gesture_type required in parameters', 'gesture');
      }

      const target = params.target || 'booted';
      const gestureType = params.parameters.gesture_type;

      if (gestureType === 'swipe') {
        // Swipe gesture requires coordinates
        const { start_x, start_y, end_x, end_y, duration = 200 } = params.parameters;

        if (
          start_x === undefined ||
          start_y === undefined ||
          end_x === undefined ||
          end_y === undefined
        ) {
          return this.formatError(
            'start_x, start_y, end_x, end_y required for swipe gesture',
            'gesture'
          );
        }

        // CRITICAL: Convert to integers - idb CLI rejects float coordinates
        const intStartX = Math.round(start_x);
        const intStartY = Math.round(start_y);
        const intEndX = Math.round(end_x);
        const intEndY = Math.round(end_y);
        const command = `idb ui swipe --udid "${target}" ${intStartX} ${intStartY} ${intEndX} ${intEndY} --duration ${duration}`;
        await executeCommand(command);

        const data: IDBOperationResultData = {
          message: `Swiped from (${start_x},${start_y}) to (${end_x},${end_y})`,
          note: `Swipe duration: ${duration}ms`,
        };

        return this.formatSuccess(data);
      } else if (gestureType === 'button') {
        // Button press
        const { button } = params.parameters;

        if (!button) {
          return this.formatError('button required for button gesture', 'gesture');
        }

        const command = `idb ui button --udid "${target}" ${button}`;
        await executeCommand(command);

        const data: IDBOperationResultData = {
          message: `Pressed ${button} button`,
          note: 'Hardware button press completed',
        };

        return this.formatSuccess(data);
      }

      return this.formatError(`Unknown gesture_type: ${gestureType}`, 'gesture');
    } catch (error) {
      logger.error('Gesture operation failed', error as Error);
      return this.formatError(error as Error, 'gesture');
    }
  }

  private async executeDescribe(
    params: Partial<DescribeParams>
  ): Promise<OperationResult<IDBResultData>> {
    try {
      const { executeCommand } = await import('../utils/command.js');
      const target = params.target || 'booted';
      const operation = params.parameters?.operation || 'all';

      // Execute idb ui describe-all (or describe-point for specific coordinates)
      // CORRECT ordering: idb ui describe-all --udid UDID or idb ui describe-point x y --udid UDID
      let command: string;
      if (operation === 'point' && params.parameters?.x && params.parameters?.y) {
        const x = params.parameters.x;
        const y = params.parameters.y;
        // CRITICAL: Convert to integers - idb CLI rejects float coordinates
        const intX = Math.round(x);
        const intY = Math.round(y);
        command = `idb ui describe-point --udid "${target}" ${intX} ${intY}`;
      } else {
        command = `idb ui describe-all --udid "${target}"`;
      }

      const result = await executeCommand(command);
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
      const { executeCommand } = await import('../utils/command.js');

      if (!params.parameters?.query) {
        return this.formatError('query required', 'find-element');
      }

      const target = params.target || 'booted';
      const query = params.parameters.query;

      // First, get the full accessibility tree
      const command = `idb ui describe-all --udid "${target}"`;
      const describeResult = await executeCommand(command);

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

  /**
   * Manages app lifecycle via IDB
   * Supports: install, uninstall, launch, terminate
   */
  private async executeApp(params: Partial<IDBAppParams>): Promise<OperationResult<IDBResultData>> {
    try {
      const { executeCommand } = await import('../utils/command.js');

      if (!params.parameters?.sub_operation) {
        return this.formatError('sub_operation required in parameters', 'app');
      }

      const target = params.target || 'booted';
      const subOp = params.parameters.sub_operation;
      const bundleId = params.parameters.bundle_id;
      const appPath = params.parameters.app_path;

      switch (subOp) {
        case 'install': {
          if (!appPath) {
            return this.formatError('app_path required for install', 'app');
          }

          const command = `idb install "${appPath}" --udid "${target}"`;
          await executeCommand(command);

          const data: IDBOperationResultData = {
            message: `App installed from: ${appPath}`,
            note: 'App installation completed',
            params: { sub_operation: 'install', app_path: appPath },
          };

          return this.formatSuccess(data);
        }

        case 'uninstall': {
          if (!bundleId) {
            return this.formatError('bundle_id required for uninstall', 'app');
          }

          const command = `idb uninstall "${bundleId}" --udid "${target}"`;
          await executeCommand(command);

          const data: IDBOperationResultData = {
            message: `App uninstalled: ${bundleId}`,
            note: 'App uninstallation completed',
            params: { sub_operation: 'uninstall', bundle_id: bundleId },
          };

          return this.formatSuccess(data);
        }

        case 'launch': {
          if (!bundleId) {
            return this.formatError('bundle_id required for launch', 'app');
          }

          const command = `idb launch --udid "${target}" "${bundleId}"`;
          const result = await executeCommand(command);

          // Parse PID from output if present
          let pid: string | undefined;
          const pidMatch = result.stdout.match(/pid:\s*(\d+)/i);
          if (pidMatch) {
            pid = pidMatch[1];
          }

          const data: IDBOperationResultData = {
            message: `App launched: ${bundleId}`,
            note: pid ? `Process ID: ${pid}` : 'App launched successfully',
            params: { sub_operation: 'launch', bundle_id: bundleId, pid },
          };

          return this.formatSuccess(data);
        }

        case 'terminate': {
          if (!bundleId) {
            return this.formatError('bundle_id required for terminate', 'app');
          }

          const command = `idb terminate "${bundleId}" --udid "${target}"`;
          await executeCommand(command);

          const data: IDBOperationResultData = {
            message: `App terminated: ${bundleId}`,
            note: 'App termination completed',
            params: { sub_operation: 'terminate', bundle_id: bundleId },
          };

          return this.formatSuccess(data);
        }

        default:
          return this.formatError(`Unknown sub_operation: ${subOp}`, 'app');
      }
    } catch (error) {
      logger.error('App operation failed', error as Error);
      return this.formatError(error as Error, 'app');
    }
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
      const { executeCommand } = await import('../utils/command.js');
      const target = _params.target || 'booted';

      // Get accessibility tree
      const command = `idb ui describe-all --udid "${target}"`;
      const result = await executeCommand(command);

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

  /**
   * Manages IDB target connections
   * Supports: list, describe, connect, disconnect
   */
  private async executeTargets(
    params: Partial<TargetsParams>
  ): Promise<OperationResult<IDBResultData>> {
    try {
      const { runCommand } = await import('../utils/command.js');
      const subOp = params.parameters?.sub_operation || 'list';

      switch (subOp) {
        case 'list': {
          const result = await runCommand('idb', ['list-targets', '--json']);
          const targets = JSON.parse(result.stdout);

          const targetCount = Array.isArray(targets) ? targets.length : 0;

          const data: IDBOperationResultData = {
            message: `Found ${targetCount} IDB target(s)`,
            note: 'Use describe to get details about a specific target',
            params: { sub_operation: 'list', targets },
          };

          return this.formatSuccess(data);
        }

        case 'describe': {
          const result = await runCommand('idb', ['describe', '--json']);
          const targetInfo = JSON.parse(result.stdout);

          const data: IDBOperationResultData = {
            message: 'Target description retrieved',
            note: 'Current IDB target details',
            params: { sub_operation: 'describe', ...targetInfo },
          };

          return this.formatSuccess(data);
        }

        case 'connect': {
          const data: IDBOperationResultData = {
            message: 'Target connection managed automatically',
            note: 'IDB automatically connects to the specified target (--udid) for each operation',
            params: { sub_operation: 'connect' },
          };

          return this.formatSuccess(data);
        }

        case 'disconnect': {
          const data: IDBOperationResultData = {
            message: 'Target disconnection not required',
            note: 'IDB automatically manages connections. Use list-targets to see available targets',
            params: { sub_operation: 'disconnect' },
          };

          return this.formatSuccess(data);
        }

        default:
          return this.formatError(`Unknown sub_operation: ${subOp}`, 'targets');
      }
    } catch (error) {
      logger.error('Targets operation failed', error as Error);
      return this.formatError(error as Error, 'targets');
    }
  }
}
