/**
 * Simulator Open URL Tool
 *
 * Open URL or deep link in simulator
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { OpenURLParams, AppLifecycleResultData } from '../../types/simulator.js';
export declare const simulatorOpenURLDefinition: ToolDefinition;
export declare function simulatorOpenURL(params: OpenURLParams): Promise<ToolResult<AppLifecycleResultData>>;
//# sourceMappingURL=openurl.d.ts.map