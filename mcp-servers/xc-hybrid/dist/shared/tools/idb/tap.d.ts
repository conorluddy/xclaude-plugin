/**
 * IDB Tap Tool
 *
 * Tap at coordinates (use after describe to get coordinates)
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { TapParams, TapResultData } from '../../types/idb.js';
export declare const idbTapDefinition: ToolDefinition;
export declare function idbTap(params: TapParams): Promise<ToolResult<TapResultData>>;
//# sourceMappingURL=tap.d.ts.map