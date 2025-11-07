/**
 * Base types for all MCP tools
 */

/**
 * Standard tool result structure
 */
export type ToolResult<T = Record<string, never>> = SuccessResult<T> | ErrorResult;

/**
 * Successful operation result
 */
export interface SuccessResult<T> {
  success: true;
  data: T;
  summary?: string;
  cache_id?: string;
}

/**
 * Failed operation result
 */
export interface ErrorResult {
  success: false;
  error: string;
  operation?: string;
  details?: string;
}

/**
 * MCP tool definition
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>; // MCP SDK constraint
    required?: string[];
  };
}

/**
 * Command execution result
 */
export interface CommandResult {
  stdout: string;
  stderr: string;
  code: number;
}
