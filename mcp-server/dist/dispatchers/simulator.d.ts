/**
 * Simulator Dispatcher
 *
 * Consolidates all simctl operations into a single tool.
 * Token cost: ~400 tokens (vs ~5k for 9 separate tools)
 *
 * Operations: device-lifecycle, app-lifecycle, io, push, openurl, list, health-check
 */
import { BaseDispatcher } from './base.js';
import type { ToolDefinition, SimulatorOperationArgs, SimulatorResultData, OperationResult } from '../types.js';
export declare class SimulatorDispatcher extends BaseDispatcher<SimulatorOperationArgs, SimulatorResultData> {
    getToolDefinition(): ToolDefinition;
    execute(args: SimulatorOperationArgs): Promise<OperationResult<SimulatorResultData>>;
    private executeDeviceLifecycle;
    private executeAppLifecycle;
    /**
     * Captures screenshots or records video from the simulator
     * Note: Video recording requires manual stop or process termination
     */
    private executeIO;
    /**
     * Simulates push notifications to apps in the simulator
     * Accepts JSON payload as string or file path
     */
    private executePush;
    /**
     * Opens a URL in the simulator (deep links, universal links, Safari)
     */
    private executeOpenURL;
    private executeList;
    private executeHealthCheck;
    /**
     * Gets the filesystem path to an app's container
     * Container types: 'data' (app data), 'bundle' (app bundle), 'group' (shared container)
     */
    private executeGetAppContainer;
}
//# sourceMappingURL=simulator.d.ts.map