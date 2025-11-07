/**
 * Safe command execution utilities
 */
import type { CommandResult } from '../types/base.js';
export interface CommandOptions {
    timeout?: number;
    maxBuffer?: number;
    cwd?: string;
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
export declare function runCommand(command: string, args: string[], options?: CommandOptions): Promise<CommandResult>;
/**
 * Find an Xcode project or workspace in the current directory.
 * Searches for .xcworkspace first (preferred), then .xcodeproj.
 *
 * @param searchPath - Directory to search in (defaults to current directory)
 * @returns Path to the found project/workspace, or null if not found
 */
export declare function findXcodeProject(searchPath?: string): Promise<string | null>;
/**
 * Extract error and warning lines from xcodebuild output.
 *
 * @param output - Full xcodebuild stdout/stderr
 * @param maxLines - Maximum error lines to return (default: 10)
 * @returns Array of error/warning lines
 */
export declare function extractBuildErrors(output: string, maxLines?: number): string[];
//# sourceMappingURL=command.d.ts.map