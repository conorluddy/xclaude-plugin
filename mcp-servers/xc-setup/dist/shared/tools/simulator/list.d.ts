/**
 * Simulator List Tool
 *
 * Enumerate available simulators
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { ListDevicesParams, ListDevicesResultData } from '../../types/simulator.js';
export declare const simulatorListDefinition: ToolDefinition;
export declare function simulatorList(params: ListDevicesParams): Promise<ToolResult<ListDevicesResultData>>;
//# sourceMappingURL=list.d.ts.map