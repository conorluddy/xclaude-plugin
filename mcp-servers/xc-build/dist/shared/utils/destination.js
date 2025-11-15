/**
 * Destination resolver utilities for xcodebuild operations.
 * Handles auto-resolution of incomplete destination strings by querying available simulators.
 * Integrates with config system to track usage and provide defaults.
 */
import { runCommand } from "./command.js";
import { saveUsage } from "./config.js";
/**
 * Parse simctl list output to extract available simulator devices.
 *
 * Expected format:
 * -- iOS 18.0 --
 *     iPhone 15 (UUID) (Shutdown)
 *     iPhone 15 Pro (UUID) (Booted)
 *
 * @param output - Raw output from simctl list devices
 * @returns Array of parsed simulator devices
 */
function parseSimulatorList(output) {
    const devices = [];
    const lines = output.split("\n");
    let currentRuntime = "";
    let currentOSVersion = "";
    for (const line of lines) {
        // Match runtime headers like "-- iOS 18.0 --" or "-- iOS 17.5 --"
        const runtimeMatch = line.match(/^--\s+(.+?)\s+(\d+\.\d+)\s+--$/);
        if (runtimeMatch) {
            currentRuntime = runtimeMatch[1]; // e.g., "iOS"
            currentOSVersion = runtimeMatch[2]; // e.g., "18.0"
            continue;
        }
        // Match device lines like "    iPhone 15 (UUID) (Shutdown)"
        const deviceMatch = line.match(/^\s+(.+?)\s+\(([A-Za-z0-9-]+)\)\s+\((Shutdown|Booted|Unavailable)\)/i);
        if (deviceMatch && currentRuntime && currentOSVersion) {
            const name = deviceMatch[1].trim();
            const udid = deviceMatch[2];
            const state = deviceMatch[3];
            devices.push({
                name,
                udid,
                runtime: currentRuntime,
                osVersion: currentOSVersion,
                available: state === "Shutdown" || state === "Booted",
            });
        }
    }
    return devices;
}
/**
 * Find the best matching simulator for a given device name.
 * Prefers the latest OS version available.
 *
 * @param deviceName - Name of the device to find (e.g., "iPhone 15")
 * @param devices - Array of available simulators
 * @returns The best matching device or undefined if no match
 */
function findBestMatch(deviceName, devices) {
    // Filter to available devices with matching name
    const matches = devices.filter((device) => device.available && device.name === deviceName);
    if (matches.length === 0) {
        return undefined;
    }
    // Sort by OS version (descending) to get latest
    matches.sort((a, b) => {
        const versionA = a.osVersion.split(".").map(Number);
        const versionB = b.osVersion.split(".").map(Number);
        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
            const numA = versionA[i] || 0;
            const numB = versionB[i] || 0;
            if (numA !== numB) {
                return numB - numA; // Descending order
            }
        }
        return 0;
    });
    return matches[0];
}
/**
 * Query available simulators using simctl.
 *
 * @returns Array of available simulator devices
 * @throws Error if simctl command fails
 */
async function queryAvailableSimulators() {
    try {
        const result = await runCommand("xcrun", [
            "simctl",
            "list",
            "devices",
            "available",
        ]);
        if (result.code !== 0) {
            throw new Error(`simctl command failed: ${result.stderr}`);
        }
        return parseSimulatorList(result.stdout);
    }
    catch (error) {
        throw new Error(`Failed to query simulators: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Validate a destination string format.
 *
 * @param destination - Destination string to validate
 * @returns Validation result with any warnings
 */
export function validateDestination(destination) {
    // Check for empty string
    if (!destination.trim()) {
        return {
            isValid: false,
            warning: "Destination string cannot be empty",
        };
    }
    // If it includes id=, it's explicit and valid
    if (destination.includes("id=")) {
        return { isValid: true };
    }
    // If it includes platform and name but no OS, it might be ambiguous
    if (destination.includes("platform=") &&
        destination.includes("name=") &&
        !destination.includes("OS=")) {
        return {
            isValid: true,
            warning: "Destination missing OS version - will attempt auto-resolution",
        };
    }
    // If it has all three, it's complete
    if (destination.includes("platform=") &&
        destination.includes("name=") &&
        destination.includes("OS=")) {
        return { isValid: true };
    }
    // Unknown format
    return {
        isValid: true,
        warning: "Unexpected destination format - passing through as-is",
    };
}
/**
 * Resolve a destination string, auto-completing it if necessary.
 *
 * This function handles several cases:
 * - If destination includes "id=" (UDID), pass through unchanged and track usage
 * - If destination includes "OS=", pass through unchanged and track usage
 * - If destination has "name=" but no "OS=", query simulators, add OS version, and track usage
 * - Otherwise, pass through unchanged with warning
 *
 * After successful resolution, automatically tracks usage for future reference.
 *
 * @param destination - Original destination string
 * @param projectPath - Optional project path for project-specific tracking
 * @returns Resolution result with resolved destination and metadata
 *
 * @example
 * // Auto-resolves to latest OS
 * await resolveDestination("platform=iOS Simulator,name=iPhone 15")
 * // Returns: "platform=iOS Simulator,name=iPhone 15,OS=18.0"
 *
 * @example
 * // Passes through explicit format
 * await resolveDestination("platform=iOS Simulator,name=iPhone 15,OS=17.5")
 * // Returns: "platform=iOS Simulator,name=iPhone 15,OS=17.5"
 *
 * @example
 * // Passes through UDID format
 * await resolveDestination("id=ABC-123-DEF")
 * // Returns: "id=ABC-123-DEF"
 */
export async function resolveDestination(destination, projectPath) {
    // Validate first
    const validation = validateDestination(destination);
    // If destination already includes OS version or is using UDID, pass through and track
    if (destination.includes("OS=") || destination.includes("id=")) {
        // Track usage for explicit destinations
        await saveUsage(destination, projectPath).catch((error) => {
            // Non-critical - log but don't fail
            console.warn(`Failed to track usage: ${error instanceof Error ? error.message : String(error)}`);
        });
        return {
            destination,
            wasResolved: false,
            details: "Using explicit destination format",
        };
    }
    // Check if we need to resolve (has name but no OS)
    const nameMatch = destination.match(/name=([^,]+)/);
    if (!nameMatch) {
        // No name parameter, pass through as-is
        return {
            destination,
            wasResolved: false,
            warning: validation.warning || "No device name found in destination",
        };
    }
    const deviceName = nameMatch[1].trim();
    try {
        // Query available simulators
        const devices = await queryAvailableSimulators();
        // Find best match
        const bestMatch = findBestMatch(deviceName, devices);
        if (!bestMatch) {
            // No match found - list available devices for helpful error
            const availableNames = [...new Set(devices.map((d) => d.name))].sort();
            const warning = `No available simulator found for "${deviceName}". Available: ${availableNames.slice(0, 5).join(", ")}${availableNames.length > 5 ? "..." : ""}`;
            return {
                destination,
                wasResolved: false,
                warning,
            };
        }
        // Append OS version to destination
        const resolvedDestination = `${destination},OS=${bestMatch.osVersion}`;
        // Track usage for successfully resolved destination
        await saveUsage(resolvedDestination, projectPath).catch((error) => {
            // Non-critical - log but don't fail
            console.warn(`Failed to track usage: ${error instanceof Error ? error.message : String(error)}`);
        });
        return {
            destination: resolvedDestination,
            wasResolved: true,
            details: `Resolved "${deviceName}" to ${bestMatch.runtime} ${bestMatch.osVersion} (${bestMatch.udid})`,
        };
    }
    catch (error) {
        // If resolution fails, pass through original with warning
        return {
            destination,
            wasResolved: false,
            warning: `Failed to resolve destination: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
/**
 * Get a list of all available simulator devices with their OS versions.
 * Useful for providing user-friendly error messages.
 *
 * @returns Array of available simulator devices
 */
export async function listAvailableSimulators() {
    return queryAvailableSimulators();
}
