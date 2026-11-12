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
};
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
};
/**
 * Xcodebuild execution configuration
 * Large buffer/timeout needed for complex projects with many dependencies
 */
export const XCODEBUILD_CONFIG = {
    /** Max stdout/stderr buffer (50MB) - large projects can exceed default 1MB */
    OUTPUT_BUFFER_SIZE_BYTES: 50 * 1024 * 1024,
    /** Build timeout (20 min) - clean builds with SPM resolution can be slow */
    BUILD_TIMEOUT_MS: 20 * 60 * 1000,
};
/**
 * Simulator target resolution configuration
 */
export const SIMULATOR_TARGET_CONFIG = {
    /** Regex pattern matching Apple's simulator UDID format (UUID v4) */
    UDID_REGEX_PATTERN: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
    /** Magic string recognized by simctl to mean "currently booted simulator" */
    BOOTED_DEVICE_ALIAS: "booted",
};
/**
 * IDB UI interaction defaults
 */
export const IDB_INTERACTION_CONFIG = {
    /** Default tap hold duration in seconds */
    TAP_DURATION_SECONDS: 0.1,
    /** Default swipe animation duration in milliseconds */
    SWIPE_DURATION_MS: 200,
};
/**
 * Accessibility quality assessment thresholds
 * Used to determine if screenshot fallback is needed
 */
export const ACCESSIBILITY_QUALITY_CONFIG = {
    /** Score >= this: accessibility data is sufficient for UI automation */
    GOOD_QUALITY_SCORE_THRESHOLD: 70,
    /** Score >= this but < GOOD: try accessibility first, fallback to screenshot */
    MODERATE_QUALITY_SCORE_THRESHOLD: 40,
};
/**
 * Logs tool configuration
 */
export const LOGS_CONFIG = {
    /** Default time window for log queries in minutes */
    DEFAULT_LAST_MINUTES: 5,
    /** Hard ceiling on last_minutes to prevent scanning months of logs */
    MAX_LAST_MINUTES: 60,
    /** Default maximum log entries to return */
    DEFAULT_MAX_ENTRIES: 50,
    /** Hard ceiling on max_entries to prevent token explosion */
    MAX_ENTRIES_CEILING: 200,
    /** Default log level filter */
    DEFAULT_LOG_LEVEL: "info",
    /** Timeout for `log show` command in milliseconds */
    LOG_COMMAND_TIMEOUT_MS: 30 * 1000,
    /** Default time window for crash report search in hours */
    DEFAULT_CRASH_HOURS: 24,
    /** Default number of crash reports to return */
    DEFAULT_MAX_CRASH_REPORTS: 1,
    /** Hard ceiling on crash reports to prevent token explosion */
    MAX_CRASH_REPORTS_CEILING: 5,
    /** Maximum .ips file size to read in bytes (5MB) */
    MAX_IPS_FILE_SIZE_BYTES: 5 * 1024 * 1024,
    /** Maximum backtrace frames per crash report */
    MAX_BACKTRACE_FRAMES: 20,
    /** Timeout for xcresulttool commands in milliseconds */
    XCRESULTTOOL_TIMEOUT_MS: 60 * 1000,
    /** Xcode DerivedData directory relative to home */
    DERIVED_DATA_DIR: "Library/Developer/Xcode/DerivedData",
    /** macOS diagnostic reports directory relative to home */
    DIAGNOSTIC_REPORTS_DIR: "Library/Logs/DiagnosticReports",
    /** CoreSimulator logs directory relative to home */
    CORE_SIMULATOR_LOGS_DIR: "Library/Logs/CoreSimulator",
};
