/**
 * Shared constants for all tools
 */

/**
 * Command execution configuration
 */
export const COMMAND_CONFIG = {
  /** Default timeout for command execution in milliseconds (5 minutes) */
  DEFAULT_TIMEOUT_MS: 5 * 60 * 1000,

  /** Default maximum buffer size for command output in bytes (10MB) */
  DEFAULT_MAX_BUFFER_BYTES: 10 * 1024 * 1024,
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  /** Maximum age of cached responses in milliseconds (30 minutes) */
  MAX_AGE_MS: 30 * 60 * 1000,

  /** Maximum number of cache entries to store */
  MAX_ENTRIES: 100,

  /** Debounce timeout for persistence operations in milliseconds */
  PERSISTENCE_DEBOUNCE_MS: 1000,
} as const;
