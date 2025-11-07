/**
 * Simulator Install App Tool
 *
 * Install an app on simulator
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { AppLifecycleParams, AppLifecycleResultData } from '../../types/simulator.js';
export declare const simulatorInstallAppDefinition: ToolDefinition;
export declare function simulatorInstallApp(params: AppLifecycleParams): Promise<ToolResult<AppLifecycleResultData>>;
//# sourceMappingURL=install-app.d.ts.map