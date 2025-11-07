/**
 * Simulator Shutdown Tool
 *
 * Shutdown a running simulator
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { DeviceLifecycleParams, DeviceLifecycleResultData } from '../../types/simulator.js';
export declare const simulatorShutdownDefinition: ToolDefinition;
export declare function simulatorShutdown(params: DeviceLifecycleParams): Promise<ToolResult<DeviceLifecycleResultData>>;
//# sourceMappingURL=shutdown.d.ts.map