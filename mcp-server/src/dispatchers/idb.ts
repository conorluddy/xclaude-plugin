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
    // Placeholder - will implement with xc-mcp IDB logic
    const data: IDBOperationResultData = {
      message: 'Tap operation not yet implemented',
      note: 'Will use xc-mcp idb-ui-tap logic with coordinate transformation',
      params: params.parameters,
    };
    return this.formatSuccess(data);
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
    // Placeholder
    const data: IDBOperationResultData = {
      message: 'Describe operation not yet implemented',
      note: 'Accessibility-first: returns UI tree (fast, ~50 tokens)',
      accessibility_priority: 'Use this BEFORE screenshots',
      params: params.parameters,
    };
    return this.formatSuccess(data);
  }

  private async executeFindElement(
    params: Partial<FindElementParams>
  ): Promise<OperationResult<IDBResultData>> {
    // Placeholder
    const data: IDBOperationResultData = {
      message: 'Find element operation not yet implemented',
      note: 'Semantic search in accessibility tree by label/identifier',
      params: params.parameters,
    };
    return this.formatSuccess(data);
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
    // Placeholder
    const data: IDBOperationResultData = {
      message: 'List apps operation not yet implemented',
      note: 'Will list installed apps with filtering (system/user/internal)',
      params: params.parameters,
    };
    return this.formatSuccess(data);
  }

  private async executeCheckAccessibility(
    _params: Partial<CheckAccessibilityParams>
  ): Promise<OperationResult<IDBResultData>> {
    // Placeholder
    const data: IDBOperationResultData = {
      message: 'Check accessibility operation not yet implemented',
      note: 'Quick assessment: is accessibility data sufficient or need screenshot?',
      guidance: 'Use to decide between accessibility-first vs screenshot approach',
    };
    return this.formatSuccess(data);
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
