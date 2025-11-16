/**
 * Xcode Build Tool
 *
 * Compile Xcode projects with configuration options
 */

import type { ToolDefinition, ToolResult } from "../../types/base.js";
import type { BuildParams, BuildResultData } from "../../types/xcode.js";
import {
  runCommand,
  findXcodeProject,
  extractBuildErrors,
} from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
import { resolveDestination } from "../../utils/destination.js";

// Re-export types for consumers
export type { BuildParams, BuildResultData };

export const xcodeBuildDefinition: ToolDefinition = {
  name: "xcode_build",
  description:
    "Build Xcode project for iOS apps. Check project's CLAUDE.md for preferred simulator and SDK defaults when parameters are not explicitly provided.",
  inputSchema: {
    type: "object",
    properties: {
      project_path: {
        type: "string",
        description:
          "Path to .xcodeproj or .xcworkspace (auto-detected if omitted)",
      },
      scheme: {
        type: "string",
        description: "Scheme name (required)",
      },
      configuration: {
        type: "string",
        enum: ["Debug", "Release"],
        description: "Build configuration (default: Debug)",
      },
      destination: {
        type: "string",
        description:
          'Simulator destination. Formats: "platform=iOS Simulator,name=iPhone 15" (auto-resolves OS) | "platform=iOS Simulator,name=iPhone 15,OS=18.0" | "id=UDID". If not specified, agents should check CLAUDE.md for project defaults.',
      },
    },
    required: ["scheme"],
  },
};

export async function xcodeBuild(
  params: BuildParams,
): Promise<ToolResult<BuildResultData>> {
  try {
    // Validation
    if (!params.scheme) {
      return {
        success: false,
        error: "Scheme required",
        operation: "build",
      };
    }

    // Find project if not specified
    const projectPath = params.project_path || (await findXcodeProject());
    if (!projectPath) {
      return {
        success: false,
        error: "No Xcode project found in current directory",
        operation: "build",
      };
    }

    // Build command args
    const args = [
      "-scheme",
      params.scheme,
      "-configuration",
      params.configuration || "Debug",
    ];

    if (projectPath.endsWith(".xcworkspace")) {
      args.unshift("-workspace", projectPath);
    } else {
      args.unshift("-project", projectPath);
    }

    if (params.destination) {
      // Resolve destination (auto-complete OS version if needed)
      // Pass projectPath for potential project-specific config
      const resolution = await resolveDestination(
        params.destination,
        projectPath,
      );

      // Log resolution details
      if (resolution.wasResolved) {
        logger.info(`Resolved destination: ${resolution.details}`);
      }
      if (resolution.warning) {
        logger.warn(`Destination warning: ${resolution.warning}`);
      }

      args.push("-destination", resolution.destination);
    }

    args.push("build");

    // Execute build
    logger.info(`Building project: ${params.scheme}`);
    const startTime = Date.now();
    const result = await runCommand("xcodebuild", args);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Extract errors if build failed
    const errors =
      result.code !== 0
        ? extractBuildErrors(result.stdout + "\n" + result.stderr)
        : undefined;

    // Return result
    const data: BuildResultData = {
      message: `Build ${result.code === 0 ? "succeeded" : "failed"} in ${duration}s`,
      duration,
      errors,
    };

    if (result.code === 0) {
      return {
        success: true as const,
        data,
        summary: "Build succeeded",
      };
    } else {
      return {
        success: false as const,
        error: `Build failed in ${duration}s`,
        details: errors?.join("\n"),
      };
    }
  } catch (error) {
    logger.error("Build failed", error as Error);
    return {
      success: false,
      error: String(error),
      operation: "build",
    };
  }
}
