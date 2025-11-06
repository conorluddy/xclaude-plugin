/**
 * Base dispatcher class
 * Provides common functionality for all 3 dispatchers
 */

import type { ToolDefinition, OperationResult } from '../types.js';

/**
 * Base class for all MCP dispatchers
 *
 * Provides common error handling and response formatting.
 * Each dispatcher implements specific operation logic.
 */
export abstract class BaseDispatcher<TArgs, TResult> {
  /**
   * Get the tool definition for MCP registration
   *
   * @returns Tool definition with name, description, and input schema
   */
  abstract getToolDefinition(): ToolDefinition;

  /**
   * Execute the dispatched operation
   *
   * @param args - Operation arguments (type defined by specific dispatcher)
   * @returns Result with success status and data or error
   */
  abstract execute(args: TArgs): Promise<OperationResult<TResult>>;

  /**
   * Format error response
   *
   * @param error - Error object or message
   * @param operation - Optional operation name for context
   * @returns Formatted error result
   */
  protected formatError(error: Error | string, operation?: string): OperationResult<TResult> {
    const message = error instanceof Error ? error.message : error;

    return {
      success: false,
      error: message,
      ...(operation && { operation }),
    };
  }

  /**
   * Format success response
   *
   * @param data - Operation result data
   * @param summary - Optional human-readable summary
   * @returns Formatted success result
   */
  protected formatSuccess(data: TResult, summary?: string): OperationResult<TResult> {
    return {
      success: true,
      data,
      ...(summary && { summary }),
    };
  }
}
