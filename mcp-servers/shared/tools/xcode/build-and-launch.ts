/**
 * Xcode Build and Launch Tool
 *
 * Combines build, install, and launch for rapid development workflow
 */

import type { ToolDefinition, ToolResult } from "../../types/base.js";
import type {
  BuildAndLaunchParams,
  BuildAndLaunchResultData,
} from "../../types/xcode.js";
import {
  runCommand,
  findXcodeProject,
  extractBuildErrors,
} from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
import {
  resolveDestination,
  listAvailableSimulators,
} from "../../utils/destination.js";
import * as fs from "fs/promises";
import * as path from "path";

export const xcodeBuildAndLaunchDefinition: ToolDefinition = {
  name: "xcode_build_and_launch",
  description: "Build, install, and launch iOS app on simulator",
  inputSchema: {
    type: "object",
    properties: {
      project_path: {
        type: "string",
        description: "Path to .xcodeproj/.xcworkspace (auto-detected)",
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
          'Simulator destination. Formats: "platform=iOS Simulator,name=iPhone 15" (auto-resolves OS) | "platform=iOS Simulator,name=iPhone 15,OS=18.0" | "id=UDID"',
      },
      skip_build: {
        type: "boolean",
        description: "Skip build step and only install/launch (default: false)",
      },
    },
    required: ["scheme", "destination"],
  },
};

/**
 * Find built .app bundle in DerivedData directory
 */
async function findAppInDerivedData(
  scheme: string,
  configuration: string,
): Promise<string> {
  const derivedDataPath = path.join(
    process.env.HOME || "",
    "Library/Developer/Xcode/DerivedData",
  );

  try {
    const entries = await fs.readdir(derivedDataPath);

    // Look for scheme-related DerivedData directories
    for (const entry of entries) {
      const buildPath = path.join(
        derivedDataPath,
        entry,
        "Build/Products",
        `${configuration}-iphonesimulator`,
      );

      try {
        const products = await fs.readdir(buildPath);
        const appBundle = products.find((p) => p.endsWith(".app"));

        if (appBundle) {
          return path.join(buildPath, appBundle);
        }
      } catch {
        // Directory doesn't exist or can't be read, continue
        continue;
      }
    }

    throw new Error(
      `Could not find .app bundle for scheme "${scheme}" in DerivedData`,
    );
  } catch (error) {
    throw new Error(
      `Failed to find app in DerivedData: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Extract bundle identifier from app Info.plist
 */
async function extractBundleIdentifier(appPath: string): Promise<string> {
  const plistPath = path.join(appPath, "Info.plist");

  try {
    const result = await runCommand("defaults", [
      "read",
      plistPath,
      "CFBundleIdentifier",
    ]);

    if (result.code !== 0) {
      throw new Error(`Failed to read bundle identifier: ${result.stderr}`);
    }

    return result.stdout.trim();
  } catch (error) {
    throw new Error(
      `Failed to extract bundle ID: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Format available simulators as helpful suggestions
 */
async function formatSimulatorSuggestions(): Promise<string> {
  try {
    const devices = await listAvailableSimulators();
    const available = devices.filter((d) => d.available).slice(0, 5);

    if (available.length === 0) {
      return "No available simulators found.";
    }

    const suggestions = available
      .map((d) => `- ${d.name} (iOS ${d.osVersion}) - id=${d.udid}`)
      .join("\n");

    return `Available simulators:\n${suggestions}${available.length > 5 ? "\n... and more" : ""}\n\nUsage example: destination="id=${available[0]?.udid}"`;
  } catch {
    return "Could not retrieve available simulators.";
  }
}

/**
 * Ensure simulator is running and return its UDID
 */
async function ensureSimulatorRunning(destination: string): Promise<string> {
  // Extract UDID from destination
  const udidMatch = destination.match(/id=([A-Za-z0-9-]+)/);
  if (!udidMatch) {
    const suggestions = await formatSimulatorSuggestions();
    throw new Error(
      `Could not extract simulator UDID from destination.\n\n${suggestions}`,
    );
  }

  const udid = udidMatch[1];

  // Check if simulator is running
  const listResult = await runCommand("xcrun", ["simctl", "list", "devices"]);
  const isRunning = listResult.stdout.includes(`${udid}) (Booted)`);

  if (!isRunning) {
    logger.info(`Booting simulator ${udid}...`);
    const bootResult = await runCommand("xcrun", ["simctl", "boot", udid]);

    if (bootResult.code !== 0) {
      // Check if this is an "Invalid device" error
      if (
        bootResult.stderr.includes("Invalid device") ||
        bootResult.stderr.includes("No such file")
      ) {
        const suggestions = await formatSimulatorSuggestions();
        throw new Error(
          `Simulator ${udid} not found or unavailable.\n\n${suggestions}`,
        );
      }

      logger.warn(`Failed to boot simulator: ${bootResult.stderr}`);
      // Continue anyway - it might already be booted
    }
  }

  return udid;
}

/**
 * Build iOS app and immediately install and launch on simulator
 */
export async function buildAndLaunch(
  params: BuildAndLaunchParams,
): Promise<ToolResult<BuildAndLaunchResultData>> {
  try {
    // Validation
    if (!params.scheme) {
      return {
        success: false,
        error: "Scheme required",
        operation: "build_and_run",
      };
    }

    if (!params.destination) {
      return {
        success: false,
        error: "Destination (simulator) required for build and run",
        operation: "build_and_run",
      };
    }

    // Find project if not specified
    const projectPath = params.project_path || (await findXcodeProject());
    if (!projectPath) {
      return {
        success: false,
        error: "No Xcode project found in current directory",
        operation: "build_and_run",
      };
    }

    // Resolve destination
    const resolution = await resolveDestination(
      params.destination,
      projectPath,
    );

    if (resolution.warning) {
      // If the warning is about a simulator not being found, provide helpful suggestions
      if (
        resolution.warning.includes("No available simulator found") ||
        resolution.warning.includes("Failed to resolve destination")
      ) {
        const suggestions = await formatSimulatorSuggestions();
        return {
          success: false,
          error: resolution.warning,
          details: suggestions,
          operation: "build_and_run",
        };
      }
      logger.warn(`Destination warning: ${resolution.warning}`);
    }

    const resolvedDest = resolution.destination;
    const configuration = params.configuration || "Debug";
    const result: BuildAndLaunchResultData = {
      message: "",
    };

    // Step 1: Build (unless skipped)
    if (!params.skip_build) {
      logger.info(`Building ${params.scheme}...`);
      const buildStartTime = Date.now();

      const buildArgs = [
        "-scheme",
        params.scheme,
        "-configuration",
        configuration,
      ];

      if (projectPath.endsWith(".xcworkspace")) {
        buildArgs.unshift("-workspace", projectPath);
      } else {
        buildArgs.unshift("-project", projectPath);
      }

      buildArgs.push("-destination", resolvedDest);
      buildArgs.push(
        "-derivedDataPath",
        path.join(
          process.env.HOME || "",
          "Library/Developer/Xcode/DerivedData",
        ),
      );
      buildArgs.push("build");

      const buildResult = await runCommand("xcodebuild", buildArgs);
      result.build_duration = ((Date.now() - buildStartTime) / 1000).toFixed(1);

      if (buildResult.code !== 0) {
        // Extract detailed errors and warnings from build output
        const errors = extractBuildErrors(
          buildResult.stdout + "\n" + buildResult.stderr,
        );
        const errorDetails =
          errors.length > 0
            ? errors.join("\n")
            : `Build failed with no detailed error output. Check xcodebuild log for more information.`;

        // Always append simulator suggestions on failure for quick recovery
        const simulatorSuggestions = await formatSimulatorSuggestions();
        const fullDetails = `${errorDetails}\n\n---\n\n${simulatorSuggestions}`;

        return {
          success: false,
          error: `Build failed in ${result.build_duration}s`,
          details: fullDetails,
        };
      }
    }

    // Step 2: Find app bundle
    logger.info("Finding built app bundle...");
    const appPath = await findAppInDerivedData(params.scheme, configuration);
    result.app_path = appPath;

    // Step 3: Extract bundle ID
    logger.info("Extracting bundle identifier...");
    const bundleId = await extractBundleIdentifier(appPath);
    result.bundle_id = bundleId;

    // Step 4: Ensure simulator is running
    logger.info("Ensuring simulator is running...");
    const udid = await ensureSimulatorRunning(resolvedDest);
    result.simulator_udid = udid;

    // Step 5: Install app
    logger.info(`Installing app to simulator ${udid}...`);
    const installStartTime = Date.now();

    const installResult = await runCommand("xcrun", [
      "simctl",
      "install",
      udid,
      appPath,
    ]);

    result.install_duration = ((Date.now() - installStartTime) / 1000).toFixed(
      1,
    );

    if (installResult.code !== 0) {
      // Include stderr and simulator suggestions for install failures
      const simulatorSuggestions = await formatSimulatorSuggestions();
      const installErrorDetails =
        installResult.stderr ||
        "Installation failed without detailed error output";
      const fullDetails = `${installErrorDetails}\n\n---\n\n${simulatorSuggestions}`;

      return {
        success: false,
        error: `Installation failed in ${result.install_duration}s`,
        details: fullDetails,
      };
    }

    // Step 6: Launch app
    logger.info(`Launching ${bundleId}...`);
    const launchStartTime = Date.now();

    const launchResult = await runCommand("xcrun", [
      "simctl",
      "launch",
      udid,
      bundleId,
    ]);

    result.launch_duration = ((Date.now() - launchStartTime) / 1000).toFixed(1);

    if (launchResult.code !== 0) {
      // Include stderr and simulator suggestions for launch failures
      const simulatorSuggestions = await formatSimulatorSuggestions();
      const launchErrorDetails =
        launchResult.stderr || "Launch failed without detailed error output";
      const fullDetails = `${launchErrorDetails}\n\n---\n\n${simulatorSuggestions}`;

      return {
        success: false,
        error: `Launch failed in ${result.launch_duration}s`,
        details: fullDetails,
      };
    }

    // Success
    const totalDuration =
      parseFloat(result.build_duration || "0") +
      parseFloat(result.install_duration || "0") +
      parseFloat(result.launch_duration || "0");

    result.message = `Build and launch successful in ${totalDuration.toFixed(1)}s (build: ${result.build_duration}s, install: ${result.install_duration}s, launch: ${result.launch_duration}s)`;

    return {
      success: true as const,
      data: result,
      summary: `Launched ${bundleId}`,
    };
  } catch (error) {
    logger.error("Build and run failed", error as Error);
    return {
      success: false,
      error: String(error),
      operation: "build_and_run",
    };
  }
}

// Backward compatibility exports
export const xcodeBuildAndRunDefinition = xcodeBuildAndLaunchDefinition;
export const buildAndRun = buildAndLaunch;
