/**
 * Simulator Boot Tool
 *
 * Boot a simulator device
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { DeviceLifecycleParams, DeviceLifecycleResultData } from '../../types/simulator.js';
export declare const simulatorBootDefinition: ToolDefinition;
export declare function simulatorBoot(params: DeviceLifecycleParams): Promise<ToolResult<DeviceLifecycleResultData>>;
//# sourceMappingURL=boot.d.ts.map