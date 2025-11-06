import { exec, execSync, spawn } from 'child_process';
import { promisify } from 'util';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { COMMAND_CONFIG } from '../constants.js';
const execAsync = promisify(exec);
export async function executeCommand(command, options = {}) {
    const defaultOptions = {
        timeout: COMMAND_CONFIG.DEFAULT_TIMEOUT_MS,
        maxBuffer: COMMAND_CONFIG.DEFAULT_MAX_BUFFER_BYTES,
        ...options,
    };
    try {
        const { stdout, stderr } = await execAsync(command, defaultOptions);
        return {
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            code: 0,
        };
    }
    catch (error) {
        // Handle timeout and other execution errors
        const execError = error;
        if (execError.code === 'ETIMEDOUT') {
            throw new McpError(ErrorCode.InternalError, `Command timed out after ${defaultOptions.timeout}ms: ${command}`);
        }
        return {
            stdout: execError.stdout?.trim() || '',
            stderr: execError.stderr?.trim() || execError.message || '',
            code: execError.code || 1,
        };
    }
}
/**
 * Execute a command with arguments using spawn (safer than shell execution).
 * This function does NOT invoke a shell, preventing command injection vulnerabilities.
 *
 * @param command - The command to execute (e.g., 'idb', 'xcrun')
 * @param args - Array of arguments (each element is safely passed as-is)
 * @param options - Execution options
 * @returns Command result with stdout, stderr, and exit code
 */
export async function executeCommandWithArgs(command, args, options = {}) {
    const defaultOptions = {
        timeout: COMMAND_CONFIG.DEFAULT_TIMEOUT_MS,
        maxBuffer: COMMAND_CONFIG.DEFAULT_MAX_BUFFER_BYTES,
        ...options,
    };
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: defaultOptions.cwd,
            timeout: defaultOptions.timeout,
        });
        let stdout = '';
        let stderr = '';
        let killed = false;
        // Set up timeout
        const timeoutId = setTimeout(() => {
            killed = true;
            child.kill();
            reject(new McpError(ErrorCode.InternalError, `Command timed out after ${defaultOptions.timeout}ms: ${command} ${args.join(' ')}`));
        }, defaultOptions.timeout);
        // Collect stdout
        child.stdout?.on('data', (data) => {
            stdout += data.toString();
            if (stdout.length > defaultOptions.maxBuffer) {
                killed = true;
                child.kill();
                clearTimeout(timeoutId);
                reject(new McpError(ErrorCode.InternalError, `Command output exceeded max buffer size of ${defaultOptions.maxBuffer} bytes`));
            }
        });
        // Collect stderr
        child.stderr?.on('data', (data) => {
            stderr += data.toString();
        });
        // Handle process exit
        child.on('close', (code) => {
            clearTimeout(timeoutId);
            if (!killed) {
                resolve({
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    code: code || 0,
                });
            }
        });
        // Handle process errors
        child.on('error', (error) => {
            clearTimeout(timeoutId);
            if (!killed) {
                reject(new McpError(ErrorCode.InternalError, `Failed to execute command: ${error.message}`));
            }
        });
    });
}
export function executeCommandSync(command) {
    try {
        const stdout = execSync(command, {
            encoding: 'utf8',
            maxBuffer: COMMAND_CONFIG.DEFAULT_MAX_BUFFER_BYTES,
        });
        return {
            stdout: stdout.trim(),
            stderr: '',
            code: 0,
        };
    }
    catch (error) {
        const execError = error;
        return {
            stdout: execError.stdout?.trim() || '',
            stderr: execError.stderr?.trim() || execError.message || '',
            code: execError.status || 1,
        };
    }
}
export function buildXcodebuildCommand(action, projectPath, options = {}) {
    const parts = ['xcodebuild'];
    // Add project or workspace
    if (options.workspace || projectPath.endsWith('.xcworkspace')) {
        parts.push('-workspace', `"${projectPath}"`);
    }
    else {
        parts.push('-project', `"${projectPath}"`);
    }
    // Add scheme if provided
    if (options.scheme) {
        parts.push('-scheme', `"${options.scheme}"`);
    }
    // Add configuration if provided
    if (options.configuration) {
        parts.push('-configuration', options.configuration);
    }
    // Add destination if provided
    if (options.destination) {
        parts.push('-destination', `"${options.destination}"`);
    }
    // Add SDK if provided
    if (options.sdk) {
        parts.push('-sdk', options.sdk);
    }
    // Add derived data path if provided
    if (options.derivedDataPath) {
        parts.push('-derivedDataPath', `"${options.derivedDataPath}"`);
    }
    // Add JSON flag if requested
    if (options.json) {
        parts.push('-json');
    }
    // Add action (build, clean, archive, etc.)
    if (action) {
        parts.push(action);
    }
    return parts.join(' ');
}
export function buildSimctlCommand(action, options = {}) {
    const parts = ['xcrun', 'simctl'];
    // Add action
    parts.push(action);
    // Add JSON flag if requested and supported
    if (options.json && ['list'].includes(action)) {
        parts.push('-j');
    }
    // Add device ID for device-specific actions
    if (options.deviceId && ['boot', 'shutdown', 'delete'].includes(action)) {
        parts.push(options.deviceId);
    }
    // Add device creation parameters
    if (action === 'create' && options.name && options.deviceType && options.runtime) {
        parts.push(`"${options.name}"`, options.deviceType, options.runtime);
    }
    return parts.join(' ');
}
/**
 * Execute a command with arguments (wrapper around executeCommandWithArgs).
 * Matches the API expected by dispatcher implementations.
 *
 * @param command - The command to execute
 * @param args - Array of arguments
 * @param options - Execution options
 * @returns Command result with stdout, stderr, and exit code
 */
export async function runCommand(command, args, options) {
    return executeCommandWithArgs(command, args, options);
}
/**
 * Find an Xcode project or workspace in the current directory.
 * Searches for .xcworkspace first (preferred), then .xcodeproj.
 *
 * @param searchPath - Directory to search in (defaults to current directory)
 * @returns Path to the found project/workspace, or null if not found
 */
export async function findXcodeProject(searchPath = '.') {
    try {
        // Search for .xcworkspace first (preferred over .xcodeproj)
        const workspaceResult = await executeCommand(`find "${searchPath}" -maxdepth 2 -name "*.xcworkspace" -type d | head -1`, { timeout: 5000 });
        if (workspaceResult.stdout) {
            return workspaceResult.stdout.trim();
        }
        // Fall back to .xcodeproj
        const projectResult = await executeCommand(`find "${searchPath}" -maxdepth 2 -name "*.xcodeproj" -type d | head -1`, { timeout: 5000 });
        if (projectResult.stdout) {
            return projectResult.stdout.trim();
        }
        return null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=command.js.map