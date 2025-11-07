/**
 * Xcode Build Tool
 *
 * Compile Xcode projects with configuration options
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { BuildParams, BuildResultData } from '../../types/xcode.js';
export type { BuildParams, BuildResultData };
export declare const xcodeBuildDefinition: ToolDefinition;
export declare function xcodeBuild(params: BuildParams): Promise<ToolResult<BuildResultData>>;
//# sourceMappingURL=build.d.ts.map