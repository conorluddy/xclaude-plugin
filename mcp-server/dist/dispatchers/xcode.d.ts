/**
 * Xcode Dispatcher
 *
 * Consolidates all xcodebuild operations into a single tool.
 * Token cost: ~400 tokens (vs ~4k for 7 separate tools)
 *
 * Operations: build, clean, test, list, version
 */
import { BaseDispatcher } from './base.js';
import type { ToolDefinition, XcodeOperationArgs, XcodeResultData, OperationResult } from '../types.js';
export declare class XcodeDispatcher extends BaseDispatcher<XcodeOperationArgs, XcodeResultData> {
    getToolDefinition(): ToolDefinition;
    execute(args: XcodeOperationArgs): Promise<OperationResult<XcodeResultData>>;
    private executeBuild;
    private executeClean;
    private executeTest;
    private executeList;
    private executeVersion;
}
//# sourceMappingURL=xcode.d.ts.map