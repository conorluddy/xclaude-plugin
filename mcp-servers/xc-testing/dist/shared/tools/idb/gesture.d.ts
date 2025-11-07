/**
 * IDB Gesture Tool
 *
 * Perform swipes and hardware button presses
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { GestureParams, GestureResultData } from '../../types/idb.js';
export declare const idbGestureDefinition: ToolDefinition;
export declare function idbGesture(params: GestureParams): Promise<ToolResult<GestureResultData>>;
//# sourceMappingURL=gesture.d.ts.map