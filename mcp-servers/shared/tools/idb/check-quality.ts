/**
 * IDB Check Accessibility Quality Tool
 *
 * Assess accessibility data quality (determines if screenshot needed)
 */

import type { ToolDefinition, ToolResult } from '../../types/base.js';
import type {
  CheckAccessibilityParams,
  AccessibilityQualityResultData,
} from '../../types/idb.js';
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
import { resolveSimulatorTarget } from '../../utils/simulator.js';

export const idbCheckQualityDefinition: ToolDefinition = {
  name: 'idb_check_quality',
  description: 'Check accessibility data quality (use before deciding on screenshot)',
  inputSchema: {
    type: 'object',
    properties: {
      target: {
        type: 'string',
        description: 'Target device (default: "booted")',
      },
    },
  },
};

export async function idbCheckQuality(
  params: CheckAccessibilityParams
): Promise<ToolResult<AccessibilityQualityResultData>> {
  try {
    const target = params.target || 'booted';

    // Resolve target to actual UDID
    const resolvedTarget = await resolveSimulatorTarget(target);

    // Execute describe to get all elements
    logger.info('Checking accessibility quality');
    const result = await runCommand('idb', ['ui', 'describe-all', '--udid', resolvedTarget, '--json']);

    // Parse and analyze
    const json = JSON.parse(result.stdout);
    let totalElements = 0;
    let labeledElements = 0;
    let interactiveElements = 0;

    if (Array.isArray(json)) {
      totalElements = json.length;
      labeledElements = json.filter((e) => e.label && e.label.length > 0).length;
      interactiveElements = json.filter((e) => e.type?.includes('Button') || e.type?.includes('TextField')).length;
    }

    // Calculate quality score
    const labelRatio = totalElements > 0 ? labeledElements / totalElements : 0;
    const score = Math.round(labelRatio * 100);

    // Determine recommendation
    let recommendation = '';
    if (score >= 70) {
      recommendation = 'Accessibility data sufficient - use idb_describe';
    } else if (score >= 40) {
      recommendation = 'Moderate accessibility - try idb_describe first, screenshot if needed';
    } else {
      recommendation = 'Poor accessibility data - screenshot recommended';
    }

    const data: AccessibilityQualityResultData = {
      score,
      labeled_elements: labeledElements,
      interactive_elements: interactiveElements,
      total_elements: totalElements,
      recommendation,
      message: `Accessibility score: ${score}%`,
    };

    return {
      success: true as const,
      data,
      summary: `Score: ${score}%`,
    };
  } catch (error) {
    logger.error('Check quality failed', error as Error);
    return {
      success: false,
      error: String(error),
      operation: 'check-quality',
    };
  }
}
