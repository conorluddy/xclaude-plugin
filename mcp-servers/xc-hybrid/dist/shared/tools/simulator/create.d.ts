/**
 * Simulator Create Tool
 *
 * Create a new simulator device
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { DeviceLifecycleParams, DeviceLifecycleResultData } from '../../types/simulator.js';
export declare const simulatorCreateDefinition: ToolDefinition;
export declare function simulatorCreate(params: DeviceLifecycleParams): Promise<ToolResult<DeviceLifecycleResultData>>;
//# sourceMappingURL=create.d.ts.map