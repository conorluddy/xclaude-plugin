/**
 * Xcode Clean Tool
 *
 * Remove build artifacts
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { CleanParams, BuildResultData } from '../../types/xcode.js';
export declare const xcodeCleanDefinition: ToolDefinition;
export declare function xcodeClean(params: CleanParams): Promise<ToolResult<BuildResultData>>;
//# sourceMappingURL=clean.d.ts.map