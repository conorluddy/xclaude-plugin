/**
 * Shared constants for all tools
 */
/**
 * Command execution configuration
 */
export declare const COMMAND_CONFIG: {
    /** Default timeout for command execution in milliseconds (5 minutes) */
    readonly DEFAULT_TIMEOUT_MS: number;
    /** Default maximum buffer size for command output in bytes (10MB) */
    readonly DEFAULT_MAX_BUFFER_BYTES: number;
};
/**
 * Cache configuration
 */
export declare const CACHE_CONFIG: {
    /** Maximum age of cached responses in milliseconds (30 minutes) */
    readonly MAX_AGE_MS: number;
    /** Maximum number of cache entries to store */
    readonly MAX_ENTRIES: 100;
    /** Debounce timeout for persistence operations in milliseconds */
    readonly PERSISTENCE_DEBOUNCE_MS: 1000;
};
//# sourceMappingURL=constants.d.ts.map