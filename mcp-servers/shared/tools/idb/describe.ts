/**
 * IDB Describe Tool
 *
 * Query UI accessibility tree (accessibility-first approach)
 */

import type { ToolDefinition, ToolResult } from "../../types/base.js";
import type {
  DescribeParams,
  DescribeResultData,
  UIElement,
} from "../../types/idb.js";
import { runCommand } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
import { resolveSimulatorTarget } from "../../utils/simulator.js";

export const idbDescribeDefinition: ToolDefinition = {
  name: "idb_describe",
  description: "Query UI accessibility tree",
  inputSchema: {
    type: "object",
    properties: {
      target: {
        type: "string",
        description: 'Target device (default: "booted")',
      },
      operation: {
        type: "string",
        enum: ["all", "point"],
        description: "Get all elements or query specific point",
      },
      x: {
        type: "number",
        description: "X coordinate (for point operation)",
      },
      y: {
        type: "number",
        description: "Y coordinate (for point operation)",
      },
    },
  },
};

export async function idbDescribe(
  params: DescribeParams,
): Promise<ToolResult<DescribeResultData>> {
  try {
    const target = params.target || "booted";
    const operation = params.operation || "all";

    // Resolve target to actual UDID
    const resolvedTarget = await resolveSimulatorTarget(target);

    // Execute describe command
    logger.info(`Querying accessibility tree: ${operation}`);

    let result;
    if (operation === "all") {
      result = await runCommand("idb", [
        "ui",
        "describe-all",
        "--udid",
        resolvedTarget,
        "--json",
      ]);
    } else if (
      operation === "point" &&
      params.x !== undefined &&
      params.y !== undefined
    ) {
      result = await runCommand("idb", [
        "ui",
        "describe-point",
        String(params.x),
        String(params.y),
        "--udid",
        resolvedTarget,
        "--json",
      ]);
    } else {
      return {
        success: false,
        error: "Invalid operation or missing coordinates",
        operation: "describe",
      };
    }

    // Parse JSON output
    const json = JSON.parse(result.stdout);
    const elements: UIElement[] = [];

    // Transform IDB output to our format
    if (Array.isArray(json)) {
      for (const elem of json) {
        elements.push({
          label: elem.label,
          value: elem.value,
          type: elem.type,
          centerX: elem.frame?.x + elem.frame?.width / 2,
          centerY: elem.frame?.y + elem.frame?.height / 2,
          frame: elem.frame,
        });
      }
    }

    const data: DescribeResultData = {
      message: `Found ${elements.length} UI elements`,
      elements: operation === "all" ? elements : undefined,
      element: operation === "point" ? elements[0] : undefined,
      note: "Use centerX/centerY for tap coordinates",
    };

    return {
      success: true as const,
      data,
      summary: `${elements.length} elements`,
    };
  } catch (error) {
    logger.error("Describe failed", error as Error);
    return {
      success: false,
      error: String(error),
      operation: "describe",
    };
  }
}
