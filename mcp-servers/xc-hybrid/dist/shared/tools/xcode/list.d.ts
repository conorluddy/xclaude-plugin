/**
 * Xcode List Tool
 *
 * Enumerate schemes and targets
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { ListParams, ListResultData } from '../../types/xcode.js';
export declare const xcodeListDefinition: ToolDefinition;
export declare function xcodeList(params: ListParams): Promise<ToolResult<ListResultData>>;
//# sourceMappingURL=list.d.ts.map