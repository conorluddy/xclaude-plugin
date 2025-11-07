/**
 * IDB Check Accessibility Quality Tool
 *
 * Assess accessibility data quality (determines if screenshot needed)
 */
import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type { CheckAccessibilityParams, AccessibilityQualityResultData } from '../../types/idb.js';
export declare const idbCheckQualityDefinition: ToolDefinition;
export declare function idbCheckQuality(params: CheckAccessibilityParams): Promise<ToolResult<AccessibilityQualityResultData>>;
//# sourceMappingURL=check-quality.d.ts.map