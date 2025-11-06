/**
 * Application Constants
 *
 * Centralized configuration values to avoid magic numbers throughout the codebase.
 */
/**
 * Response Cache Configuration
 */
export declare const CACHE_CONFIG: {
    /** Maximum age of cached responses in milliseconds (30 minutes) */
    readonly MAX_AGE_MS: number;
    /** Maximum number of cache entries to store */
    readonly MAX_ENTRIES: 100;
    /** Debounce timeout for persistence operations in milliseconds */
    readonly PERSISTENCE_DEBOUNCE_MS: 1000;
};
/**
 * Command Execution Configuration
 */
export declare const COMMAND_CONFIG: {
    /** Default timeout for command execution in milliseconds (5 minutes) */
    readonly DEFAULT_TIMEOUT_MS: number;
    /** Default maximum buffer size for command output in bytes (10MB) */
    readonly DEFAULT_MAX_BUFFER_BYTES: number;
};
//# sourceMappingURL=constants.d.ts.map