/**
 * Xcode Version Tool
 *
 * Get Xcode installation details
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { VersionParams, VersionResultData } from '../../types/xcode.js';
export declare const xcodeVersionDefinition: ToolDefinition;
export declare function xcodeVersion(params: VersionParams): Promise<ToolResult<VersionResultData>>;
//# sourceMappingURL=version.d.ts.map