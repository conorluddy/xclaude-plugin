/**
 * Xcode Build and Run Tool
 *
 * Combines build, install, and launch for rapid development workflow
 */
import { runCommand, findXcodeProject } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
import { resolveDestination } from "../../utils/destination.js";
import * as fs from "fs/promises";
import * as path from "path";
export const xcodeBuildAndRunDefinition = {
    name: "xcode_build_and_run",
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
                description: 'Simulator destination. Formats: "platform=iOS Simulator,name=iPhone 15" (auto-resolves OS) | "platform=iOS Simulator,name=iPhone 15,OS=18.0" | "id=UDID"',
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
async function findAppInDerivedData(scheme, configuration) {
    const derivedDataPath = path.join(process.env.HOME || "", "Library/Developer/Xcode/DerivedData");
    try {
        const entries = await fs.readdir(derivedDataPath);
        // Look for scheme-related DerivedData directories
        for (const entry of entries) {
            const buildPath = path.join(derivedDataPath, entry, "Build/Products", `${configuration}-iphonesimulator`);
            try {
                const products = await fs.readdir(buildPath);
                const appBundle = products.find((p) => p.endsWith(".app"));
                if (appBundle) {
                    return path.join(buildPath, appBundle);
                }
            }
            catch {
                // Directory doesn't exist or can't be read, continue
                continue;
            }
        }
        throw new Error(`Could not find .app bundle for scheme "${scheme}" in DerivedData`);
    }
    catch (error) {
        throw new Error(`Failed to find app in DerivedData: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Extract bundle identifier from app Info.plist
 */
async function extractBundleIdentifier(appPath) {
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
    }
    catch (error) {
        throw new Error(`Failed to extract bundle ID: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Ensure simulator is running and return its UDID
 */
async function ensureSimulatorRunning(destination) {
    // Extract UDID from destination
    const udidMatch = destination.match(/id=([A-Za-z0-9-]+)/);
    if (!udidMatch) {
        throw new Error("Could not extract simulator UDID from destination - use explicit id= format or full platform/name/OS");
    }
    const udid = udidMatch[1];
    // Check if simulator is running
    const listResult = await runCommand("xcrun", ["simctl", "list", "devices"]);
    const isRunning = listResult.stdout.includes(`${udid}) (Booted)`);
    if (!isRunning) {
        logger.info(`Booting simulator ${udid}...`);
        const bootResult = await runCommand("xcrun", ["simctl", "boot", udid]);
        if (bootResult.code !== 0) {
            logger.warn(`Failed to boot simulator: ${bootResult.stderr}`);
            // Continue anyway - it might already be booted
        }
    }
    return udid;
}
/**
 * Build iOS app and immediately install and launch on simulator
 */
export async function buildAndRun(params) {
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
        const resolution = await resolveDestination(params.destination, projectPath);
        if (resolution.warning) {
            logger.warn(`Destination warning: ${resolution.warning}`);
        }
        const resolvedDest = resolution.destination;
        const configuration = params.configuration || "Debug";
        const result = {
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
            }
            else {
                buildArgs.unshift("-project", projectPath);
            }
            buildArgs.push("-destination", resolvedDest);
            buildArgs.push("-derivedDataPath", path.join(process.env.HOME || "", "Library/Developer/Xcode/DerivedData"));
            buildArgs.push("build");
            const buildResult = await runCommand("xcodebuild", buildArgs);
            result.build_duration = ((Date.now() - buildStartTime) / 1000).toFixed(1);
            if (buildResult.code !== 0) {
                return {
                    success: false,
                    error: `Build failed in ${result.build_duration}s`,
                    details: buildResult.stderr,
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
        result.install_duration = ((Date.now() - installStartTime) / 1000).toFixed(1);
        if (installResult.code !== 0) {
            return {
                success: false,
                error: `Installation failed in ${result.install_duration}s`,
                details: installResult.stderr,
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
            return {
                success: false,
                error: `Launch failed in ${result.launch_duration}s`,
                details: launchResult.stderr,
            };
        }
        // Success
        const totalDuration = parseFloat(result.build_duration || "0") +
            parseFloat(result.install_duration || "0") +
            parseFloat(result.launch_duration || "0");
        result.message = `Build and run successful in ${totalDuration.toFixed(1)}s (build: ${result.build_duration}s, install: ${result.install_duration}s, launch: ${result.launch_duration}s)`;
        return {
            success: true,
            data: result,
            summary: `Launched ${bundleId}`,
        };
    }
    catch (error) {
        logger.error("Build and run failed", error);
        return {
            success: false,
            error: String(error),
            operation: "build_and_run",
        };
    }
}
