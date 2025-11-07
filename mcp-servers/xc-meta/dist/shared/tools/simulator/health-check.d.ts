/**
 * Simulator Health Check Tool
 *
 * Validate iOS development environment
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { HealthCheckParams, HealthCheckResultData } from '../../types/simulator.js';
export declare const simulatorHealthCheckDefinition: ToolDefinition;
export declare function simulatorHealthCheck(_params: HealthCheckParams): Promise<ToolResult<HealthCheckResultData>>;
//# sourceMappingURL=health-check.d.ts.map