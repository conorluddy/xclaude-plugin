/**
 * Safe command execution utilities
 */
import { spawn } from 'child_process';
import { COMMAND_CONFIG } from './constants.js';
/**
 * Execute a command with arguments using spawn (safer than shell execution).
 * This function does NOT invoke a shell, preventing command injection vulnerabilities.
 *
 * @param command - The command to execute (e.g., 'idb', 'xcrun')
 * @param args - Array of arguments (each element is safely passed as-is)
 * @param options - Execution options
 * @returns Command result with stdout, stderr, and exit code
 */
export async function runCommand(command, args, options = {}) {
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
            reject(new Error(`Command timed out after ${defaultOptions.timeout}ms`));
        }, defaultOptions.timeout);
        // Collect stdout
        child.stdout?.on('data', (data) => {
            stdout += data.toString();
            if (stdout.length > defaultOptions.maxBuffer) {
                killed = true;
                child.kill();
                clearTimeout(timeoutId);
                reject(new Error(`Command output exceeded max buffer size`));
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
                reject(new Error(`Failed to execute command: ${error.message}`));
            }
        });
    });
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
        // Search for .xcworkspace first
        const workspaceResult = await runCommand('find', [
            searchPath,
            '-maxdepth',
            '2',
            '-name',
            '*.xcworkspace',
            '-type',
            'd',
        ]);
        const workspacePath = workspaceResult.stdout.split('\n')[0]?.trim();
        if (workspacePath) {
            return workspacePath;
        }
        // Fall back to .xcodeproj
        const projectResult = await runCommand('find', [
            searchPath,
            '-maxdepth',
            '2',
            '-name',
            '*.xcodeproj',
            '-type',
            'd',
        ]);
        const projectPath = projectResult.stdout.split('\n')[0]?.trim();
        if (projectPath) {
            return projectPath;
        }
        return null;
    }
    catch {
        return null;
    }
}
/**
 * Extract error and warning lines from xcodebuild output.
 *
 * @param output - Full xcodebuild stdout/stderr
 * @param maxLines - Maximum error lines to return (default: 10)
 * @returns Array of error/warning lines
 */
export function extractBuildErrors(output, maxLines = 10) {
    const lines = output.split('\n');
    const errors = [];
    for (const line of lines) {
        if (line.includes('error:') ||
            line.includes('Error:') ||
            line.includes('ERROR') ||
            line.includes('warning:') ||
            line.includes('fatal error')) {
            errors.push(line.trim());
            if (errors.length >= maxLines) {
                break;
            }
        }
    }
    return errors;
}
