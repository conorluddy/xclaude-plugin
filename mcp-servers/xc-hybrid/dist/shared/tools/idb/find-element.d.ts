/**
 * IDB Find Element Tool
 *
 * Search UI elements by label/identifier (semantic search)
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { FindElementParams, FindElementResultData } from '../../types/idb.js';
export declare const idbFindElementDefinition: ToolDefinition;
export declare function idbFindElement(params: FindElementParams): Promise<ToolResult<FindElementResultData>>;
//# sourceMappingURL=find-element.d.ts.map