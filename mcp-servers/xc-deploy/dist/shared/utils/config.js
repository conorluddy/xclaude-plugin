import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
const USER_CONFIG_DIR = path.join(os.homedir(), ".xcplugin");
const USER_CONFIG_FILE = path.join(USER_CONFIG_DIR, "config.json");
const PROJECT_CONFIG_FILE = ".xcplugin";
/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
    maxRecentHistory: 10,
    recentSimulators: [],
};
/**
 * Loads user-level configuration from ~/.xcplugin/config.json
 *
 * @returns User configuration or empty object if not found
 */
async function loadUserConfig() {
    try {
        const content = await fs.readFile(USER_CONFIG_FILE, "utf-8");
        return JSON.parse(content);
    }
    catch (error) {
        // File doesn't exist or is invalid - return empty config
        if (error.code === "ENOENT") {
            return {};
        }
        console.warn(`Failed to load user config: ${error.message}`);
        return {};
    }
}
/**
 * Loads project-level configuration from .xcplugin in project root
 *
 * @param projectPath - Path to the project directory (defaults to cwd)
 * @returns Project configuration or empty object if not found
 */
async function loadProjectConfig(projectPath) {
    const configPath = path.join(projectPath || process.cwd(), PROJECT_CONFIG_FILE);
    try {
        const content = await fs.readFile(configPath, "utf-8");
        return JSON.parse(content);
    }
    catch (error) {
        // File doesn't exist or is invalid - return empty config
        if (error.code === "ENOENT") {
            return {};
        }
        console.warn(`Failed to load project config: ${error.message}`);
        return {};
    }
}
/**
 * Loads and merges configuration from both user and project levels
 * Project config takes precedence over user config
 *
 * @param projectPath - Path to the project directory (defaults to cwd)
 * @returns Merged configuration
 */
export async function loadConfig(projectPath) {
    const userConfig = await loadUserConfig();
    const projectConfig = await loadProjectConfig(projectPath);
    // Merge configurations (project overrides user)
    const merged = {
        ...DEFAULT_CONFIG,
        ...userConfig,
        ...projectConfig,
        source: Object.keys(projectConfig).length > 0
            ? "project"
            : Object.keys(userConfig).length > 0
                ? "user"
                : "merged",
    };
    return merged;
}
/**
 * Saves usage tracking for a simulator destination
 * Updates the most recently used simulator and increments usage count
 *
 * @param destination - Resolved destination string to track
 * @param projectPath - Optional project path for project-specific tracking
 */
export async function saveUsage(destination, projectPath) {
    try {
        // Load current config
        const config = await loadConfig(projectPath);
        const maxHistory = config.maxRecentHistory || DEFAULT_CONFIG.maxRecentHistory || 10;
        // Initialize or get existing recent simulators
        const recentSimulators = config.recentSimulators || [];
        // Find existing entry
        const existingIndex = recentSimulators.findIndex((entry) => entry.destination === destination);
        if (existingIndex >= 0) {
            // Update existing entry
            recentSimulators[existingIndex] = {
                destination,
                lastUsed: new Date().toISOString(),
                count: recentSimulators[existingIndex].count + 1,
            };
        }
        else {
            // Add new entry
            recentSimulators.push({
                destination,
                lastUsed: new Date().toISOString(),
                count: 1,
            });
        }
        // Sort by last used (most recent first)
        recentSimulators.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
        // Trim to max history
        const trimmedRecentSimulators = recentSimulators.slice(0, maxHistory);
        // Save back to user config (we track usage globally, not per-project)
        const userConfig = await loadUserConfig();
        const updatedConfig = {
            ...userConfig,
            recentSimulators: trimmedRecentSimulators,
        };
        // Ensure config directory exists
        await fs.mkdir(USER_CONFIG_DIR, { recursive: true });
        // Write updated config
        await fs.writeFile(USER_CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), "utf-8");
    }
    catch (error) {
        console.warn(`Failed to save usage: ${error.message}`);
        // Don't throw - usage tracking is non-critical
    }
}
/**
 * Gets the default simulator from config or recent usage
 * Returns undefined if no default is configured and no recent usage exists
 *
 * @param projectPath - Optional project path to check for project-specific default
 * @returns Default simulator destination string or undefined
 */
export async function getDefaultSimulator(projectPath) {
    const config = await loadConfig(projectPath);
    // Priority 1: Explicit default from config
    if (config.defaultSimulator) {
        return config.defaultSimulator;
    }
    // Priority 2: Most recently used simulator
    if (config.recentSimulators && config.recentSimulators.length > 0) {
        return config.recentSimulators[0].destination;
    }
    // No default available
    return undefined;
}
/**
 * Gets recently used simulators sorted by last use
 *
 * @param limit - Maximum number of recent simulators to return
 * @returns Array of recent simulator usage entries
 */
export async function getRecentSimulators(limit = 5) {
    const config = await loadConfig();
    return (config.recentSimulators || []).slice(0, limit);
}
