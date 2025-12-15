/**
 * Simulator utilities for IDB target resolution
 */
import { runCommand } from "./command.js";
import { logger } from "./logger.js";
import { SIMULATOR_TARGET_CONFIG } from "./constants.js";
/**
 * Resolve "booted" or a device name to an actual simulator UDID.
 *
 * @param target - Target device identifier ("booted", device name, or UDID)
 * @returns Resolved UDID
 * @throws Error if resolution fails or no booted simulator found
 */
export async function resolveSimulatorTarget(target) {
    // If it looks like a UDID already (UUID format), return as-is
    if (SIMULATOR_TARGET_CONFIG.UDID_REGEX_PATTERN.test(target)) {
        return target;
    }
    // If target is the booted device alias, find the booted simulator
    if (target === SIMULATOR_TARGET_CONFIG.BOOTED_DEVICE_ALIAS) {
        return getBootedSimulatorUDID();
    }
    // Otherwise, try to find a simulator by name
    return getSimulatorUDIDByName(target);
}
/**
 * Get the UDID of the currently booted simulator.
 *
 * @returns UDID of booted simulator
 * @throws Error if no booted simulator found or command fails
 */
export async function getBootedSimulatorUDID() {
    try {
        const result = await runCommand("xcrun", [
            "simctl",
            "list",
            "devices",
            "booted",
            "--json",
        ]);
        if (result.code !== 0) {
            throw new Error(`Failed to list booted simulators: ${result.stderr}`);
        }
        // Parse JSON output
        const data = JSON.parse(result.stdout);
        // Find the first booted device
        for (const runtime in data.devices) {
            const devices = data.devices[runtime];
            for (const device of devices) {
                if (device.state === "Booted") {
                    logger.info(`Resolved "booted" to ${device.name} (${device.udid})`);
                    return device.udid;
                }
            }
        }
        throw new Error("No booted simulator found. Please boot a simulator first.");
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse simulator list. Is Xcode installed?");
        }
        throw error;
    }
}
/**
 * Get the UDID of a simulator by its name.
 * Prefers booted simulators if multiple matches exist.
 *
 * @param name - Name of the simulator (e.g., "iPhone 15 Pro")
 * @returns UDID of matching simulator
 * @throws Error if no matching simulator found
 */
export async function getSimulatorUDIDByName(name) {
    try {
        const result = await runCommand("xcrun", [
            "simctl",
            "list",
            "devices",
            "--json",
        ]);
        if (result.code !== 0) {
            throw new Error(`Failed to list simulators: ${result.stderr}`);
        }
        // Parse JSON output
        const data = JSON.parse(result.stdout);
        const matches = [];
        // Find all devices matching the name
        for (const runtime in data.devices) {
            const devices = data.devices[runtime];
            for (const device of devices) {
                if (device.name === name && device.isAvailable) {
                    matches.push({
                        udid: device.udid,
                        name: device.name,
                        state: device.state,
                    });
                }
            }
        }
        if (matches.length === 0) {
            throw new Error(`No simulator found with name "${name}"`);
        }
        // Prefer booted simulators
        const booted = matches.find((m) => m.state === "Booted");
        if (booted) {
            logger.info(`Resolved "${name}" to booted simulator ${booted.udid}`);
            return booted.udid;
        }
        // Otherwise return first match
        logger.info(`Resolved "${name}" to ${matches[0].udid} (${matches[0].state})`);
        return matches[0].udid;
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse simulator list. Is Xcode installed?");
        }
        throw error;
    }
}
