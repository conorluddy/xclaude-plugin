/**
 * Base dispatcher class
 * Provides common functionality for all 3 dispatchers
 */

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface DispatcherResult {
  success: boolean;
  data?: any;
  error?: string;
  cache_id?: string;
  summary?: string;
}

export abstract class BaseDispatcher {
  /**
   * Get the tool definition for MCP registration
   */
  abstract getToolDefinition(): ToolDefinition;

  /**
   * Execute the dispatched operation
   */
  abstract execute(args: any): Promise<any>;

  /**
   * Format error response
   */
  protected formatError(error: unknown, operation?: string): DispatcherResult {
    const message = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: message,
      ...(operation && { operation }),
    };
  }

  /**
   * Format success response
   */
  protected formatSuccess(data: any, summary?: string): DispatcherResult {
    return {
      success: true,
      data,
      ...(summary && { summary }),
    };
  }
}
