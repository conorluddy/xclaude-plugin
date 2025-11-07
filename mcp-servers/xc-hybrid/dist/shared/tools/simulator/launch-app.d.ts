/**
 * Simulator Launch App Tool
 *
 * Launch an app on simulator
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { AppLifecycleParams, AppLifecycleResultData } from '../../types/simulator.js';
export declare const simulatorLaunchAppDefinition: ToolDefinition;
export declare function simulatorLaunchApp(params: AppLifecycleParams): Promise<ToolResult<AppLifecycleResultData>>;
//# sourceMappingURL=launch-app.d.ts.map