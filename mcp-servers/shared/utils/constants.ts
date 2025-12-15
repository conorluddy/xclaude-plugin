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

/**
 * Xcodebuild execution configuration
 * Large buffer/timeout needed for complex projects with many dependencies
 */
export const XCODEBUILD_CONFIG = {
  /** Max stdout/stderr buffer (50MB) - large projects can exceed default 1MB */
  OUTPUT_BUFFER_SIZE_BYTES: 50 * 1024 * 1024,

  /** Build timeout (20 min) - clean builds with SPM resolution can be slow */
  BUILD_TIMEOUT_MS: 20 * 60 * 1000,

  /** Trim output to last N lines to avoid token bloat in responses */
  OUTPUT_LINE_LIMIT: 1000,
} as const;

/**
 * Simulator target resolution configuration
 */
export const SIMULATOR_TARGET_CONFIG = {
  /** Regex pattern matching Apple's simulator UDID format (UUID v4) */
  UDID_REGEX_PATTERN:
    /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,

  /** Magic string recognized by simctl to mean "currently booted simulator" */
  BOOTED_DEVICE_ALIAS: "booted",
} as const;

/**
 * IDB UI interaction defaults
 */
export const IDB_INTERACTION_CONFIG = {
  /** Default tap hold duration in seconds */
  TAP_DURATION_SECONDS: 0.1,

  /** Default swipe animation duration in milliseconds */
  SWIPE_DURATION_MS: 200,
} as const;

/**
 * Accessibility quality assessment thresholds
 * Used to determine if screenshot fallback is needed
 */
export const ACCESSIBILITY_QUALITY_CONFIG = {
  /** Score >= this: accessibility data is sufficient for UI automation */
  GOOD_QUALITY_SCORE_THRESHOLD: 70,

  /** Score >= this but < GOOD: try accessibility first, fallback to screenshot */
  MODERATE_QUALITY_SCORE_THRESHOLD: 40,
} as const;
