/**
 * Simulator Terminate App Tool
 *
 * Terminate a running app
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { AppLifecycleParams, AppLifecycleResultData } from '../../types/simulator.js';
export declare const simulatorTerminateAppDefinition: ToolDefinition;
export declare function simulatorTerminateApp(params: AppLifecycleParams): Promise<ToolResult<AppLifecycleResultData>>;
//# sourceMappingURL=terminate-app.d.ts.map