/**
 * Simulator Launch App Tool
 *
 * Launch an app on simulator
 */

import type { ToolDefinition, ToolResult } from "../../types/base.js";
import type { LaunchAppParams } from "../../types/simulator.js";
import { runCommand } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";

export const simulatorLaunchAppDefinition: ToolDefinition = {
  name: "simulator_launch_app",
  description: "Launch app on simulator",
  inputSchema: {
    type: "object",
    properties: {
      device_id: {
        type: "string",
        description: 'Device UDID or "booted" for active simulator',
      },
      app_identifier: {
        type: "string",
        description: 'App bundle identifier (e.g. "com.example.MyApp")',
      },
    },
    required: ["app_identifier"],
  },
};

/**
 * Launch app result data
 */
export interface LaunchAppResultData {
  message: string;
  device_id: string;
  app_identifier: string;
  pid?: number;
  note?: string;
}

/**
 * Launch an installed app on a simulator device by bundle identifier.
 *
 * @param params - Launch parameters
 * @param params.app_identifier - App bundle identifier (e.g., "com.example.MyApp") (required)
 * @param params.device_id - Device UDID or "booted" for active simulator (optional, defaults to "booted")
 * @param params.arguments - Optional command line arguments to pass to the app
 * @param params.environment - Optional environment variables
 * @returns Promise resolving to launch result
 *
 * @example
 * ```typescript
 * const result = await simulatorLaunchApp({
 *   app_identifier: 'com.example.MyApp',
 *   device_id: 'booted'
 * });
 * ```
 */
export async function simulatorLaunchApp(
  params: LaunchAppParams,
): Promise<ToolResult<LaunchAppResultData>> {
  try {
    // Validation
    if (!params.app_identifier) {
      return {
        success: false,
        error: "Launch failed: app_identifier is required",
        operation: "launch-app",
      };
    }

    const deviceId = params.device_id || "booted";

    // Execute launch command
    logger.info(`Launching app ${params.app_identifier} on ${deviceId}`);
    const result = await runCommand("xcrun", [
      "simctl",
      "launch",
      deviceId,
      params.app_identifier,
    ]);

    if (result.code === 0) {
      // Parse PID from output if available
      const pidMatch = result.stdout.match(/(\d+)/);
      const pid = pidMatch ? parseInt(pidMatch[1]) : undefined;

      const data: LaunchAppResultData = {
        message: "App launched successfully",
        device_id: deviceId,
        app_identifier: params.app_identifier,
        pid,
        note: pid ? `Process ID: ${pid}` : undefined,
      };

      return {
        success: true as const,
        data,
        summary: "App launched",
      };
    } else {
      return {
        success: false as const,
        error: `Launch failed: Unable to launch app '${params.app_identifier}' on device ${deviceId}`,
        details: result.stderr,
      };
    }
  } catch (error) {
    logger.error("Launch app failed", error as Error);
    return {
      success: false,
      error: `Launch failed: ${String(error)}`,
      operation: "launch-app",
    };
  }
}
