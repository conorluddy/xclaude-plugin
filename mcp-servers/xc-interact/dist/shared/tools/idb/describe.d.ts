/**
 * IDB Describe Tool
 *
 * Query UI accessibility tree (accessibility-first approach)
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { DescribeParams, DescribeResultData } from '../../types/idb.js';
export declare const idbDescribeDefinition: ToolDefinition;
export declare function idbDescribe(params: DescribeParams): Promise<ToolResult<DescribeResultData>>;
//# sourceMappingURL=describe.d.ts.map