/**
 * Simulator Delete Tool
 *
 * Delete a simulator device
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { DeviceLifecycleParams, DeviceLifecycleResultData } from '../../types/simulator.js';
export declare const simulatorDeleteDefinition: ToolDefinition;
export declare function simulatorDelete(params: DeviceLifecycleParams): Promise<ToolResult<DeviceLifecycleResultData>>;
//# sourceMappingURL=delete.d.ts.map