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

import { BaseDispatcher, ToolDefinition } from './base.js';
import { logger } from '../utils/logger.js';

export class IDBDispatcher extends BaseDispatcher {
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

  async execute(args: any): Promise<any> {
    const { operation, target, parameters } = args;

    logger.info(`Executing IDB operation: ${operation}`);

    try {
      switch (operation) {
        case 'tap':
          return await this.executeTap({ target, parameters });

        case 'input':
          return await this.executeInput({ target, parameters });

        case 'gesture':
          return await this.executeGesture({ target, parameters });

        case 'describe':
          return await this.executeDescribe({ target, parameters });

        case 'find-element':
          return await this.executeFindElement({ target, parameters });

        case 'app':
          return await this.executeApp({ target, parameters });

        case 'list-apps':
          return await this.executeListApps({ target, parameters });

        case 'check-accessibility':
          return await this.executeCheckAccessibility({ target });

        case 'targets':
          return await this.executeTargets({ parameters });

        default:
          return this.formatError(`Unknown operation: ${operation}`, operation);
      }
    } catch (error) {
      logger.error(`IDB operation failed: ${operation}`, error);
      return this.formatError(error, operation);
    }
  }

  private async executeTap(params: any): Promise<any> {
    // Placeholder - will implement with xc-mcp IDB logic
    return this.formatSuccess({
      message: 'Tap operation not yet implemented',
      note: 'Will use xc-mcp idb-ui-tap logic with coordinate transformation',
      params,
    });
  }

  private async executeInput(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'Input operation not yet implemented',
      note: 'Will support text, key, and key-sequence operations',
      params,
    });
  }

  private async executeGesture(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'Gesture operation not yet implemented',
      note: 'Will support swipe and button operations (HOME, LOCK, etc.)',
      params,
    });
  }

  private async executeDescribe(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'Describe operation not yet implemented',
      note: 'Accessibility-first: returns UI tree (fast, ~50 tokens)',
      accessibility_priority: 'Use this BEFORE screenshots',
      params,
    });
  }

  private async executeFindElement(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'Find element operation not yet implemented',
      note: 'Semantic search in accessibility tree by label/identifier',
      params,
    });
  }

  private async executeApp(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'App operation not yet implemented',
      note: 'Will support install, uninstall, launch, terminate via IDB',
      params,
    });
  }

  private async executeListApps(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'List apps operation not yet implemented',
      note: 'Will list installed apps with filtering (system/user/internal)',
      params,
    });
  }

  private async executeCheckAccessibility(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'Check accessibility operation not yet implemented',
      note: 'Quick assessment: is accessibility data sufficient or need screenshot?',
      guidance: 'Use to decide between accessibility-first vs screenshot approach',
      params,
    });
  }

  private async executeTargets(params: any): Promise<any> {
    // Placeholder
    return this.formatSuccess({
      message: 'Targets operation not yet implemented',
      note: 'Will manage IDB target connections (list, describe, connect, disconnect)',
      params,
    });
  }
}
