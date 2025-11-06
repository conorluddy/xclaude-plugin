/**
 * IDB Dispatcher
 *
 * Consolidates all IDB (iOS Development Bridge) operations into a single tool.
 * Token cost: ~400 tokens (vs ~6k for 10 separate tools)
 *
 * Operations: tap, input, gesture, describe, find-element, app, list-apps, check-accessibility
 *
 * Accessibility-First Strategy:
 * 1. Use describe (fast, 50 tokens) to query accessibility tree
 * 2. Find elements via accessibility data
 * 3. Only fallback to screenshots if accessibility insufficient
 */
import { BaseDispatcher } from './base.js';
import type { ToolDefinition, IDBOperationArgs, IDBResultData, OperationResult } from '../types.js';
export declare class IDBDispatcher extends BaseDispatcher<IDBOperationArgs, IDBResultData> {
    getToolDefinition(): ToolDefinition;
    execute(args: IDBOperationArgs): Promise<OperationResult<IDBResultData>>;
    private executeTap;
    /**
     * Input text and keyboard events to iOS apps
     * Supports: text input, single key presses, key sequences
     */
    private executeInput;
    /**
     * Performs swipe gestures and hardware button presses
     * Swipe: Requires start/end coordinates and optional duration
     * Button: Supports HOME, LOCK, SIDE_BUTTON, SIRI
     */
    private executeGesture;
    private executeDescribe;
    private executeFindElement;
    /**
     * Manages app lifecycle via IDB
     * Supports: install, uninstall, launch, terminate
     */
    private executeApp;
    private executeListApps;
    private executeCheckAccessibility;
    /**
     * Manages IDB target connections
     * Supports: list, describe, connect, disconnect
     */
    private executeTargets;
}
//# sourceMappingURL=idb.d.ts.map