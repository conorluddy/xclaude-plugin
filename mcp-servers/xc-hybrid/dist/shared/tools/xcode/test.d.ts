/**
 * Xcode Test Tool
 *
 * Run test suites with result parsing
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { TestParams, TestResultData } from '../../types/xcode.js';
export declare const xcodeTestDefinition: ToolDefinition;
export declare function xcodeTest(params: TestParams): Promise<ToolResult<TestResultData>>;
//# sourceMappingURL=test.d.ts.map