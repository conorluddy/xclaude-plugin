export interface CommandResult {
    stdout: string;
    stderr: string;
    code: number;
}
export interface CommandOptions {
    timeout?: number;
    maxBuffer?: number;
    cwd?: string;
}
export declare function executeCommand(command: string, options?: CommandOptions): Promise<CommandResult>;
/**
 * Execute a command with arguments using spawn (safer than shell execution).
 * This function does NOT invoke a shell, preventing command injection vulnerabilities.
 *
 * @param command - The command to execute (e.g., 'idb', 'xcrun')
 * @param args - Array of arguments (each element is safely passed as-is)
 * @param options - Execution options
 * @returns Command result with stdout, stderr, and exit code
 */
export declare function executeCommandWithArgs(command: string, args: string[], options?: CommandOptions): Promise<CommandResult>;
export declare function executeCommandSync(command: string): CommandResult;
export declare function buildXcodebuildCommand(action: string, projectPath: string, options?: {
    scheme?: string;
    configuration?: string;
    destination?: string;
    sdk?: string;
    derivedDataPath?: string;
    workspace?: boolean;
    json?: boolean;
    [key: string]: string | boolean | undefined;
}): string;
export declare function buildSimctlCommand(action: string, options?: {
    deviceId?: string;
    deviceType?: string;
    runtime?: string;
    name?: string;
    json?: boolean;
    [key: string]: string | boolean | undefined;
}): string;
/**
 * Execute a command with arguments (wrapper around executeCommandWithArgs).
 * Matches the API expected by dispatcher implementations.
 *
 * @param command - The command to execute
 * @param args - Array of arguments
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
//# sourceMappingURL=command.d.ts.map