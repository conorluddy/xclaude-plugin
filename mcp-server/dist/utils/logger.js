/**
 * Simple logger for MCP server
 *
 * Logs to stderr (required by MCP protocol - stdout is reserved for protocol messages).
 * Respects XC_LOG_LEVEL environment variable: debug, info, warn, error
 */
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
class Logger {
    level;
    constructor() {
        const envLevel = process.env.XC_LOG_LEVEL?.toLowerCase() || 'info';
        this.level = envLevel in LOG_LEVELS ? envLevel : 'info';
    }
    shouldLog(level) {
        return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        if (data !== undefined) {
            const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            return `${prefix} ${message}\n${dataStr}`;
        }
        return `${prefix} ${message}`;
    }
    /**
     * Log debug message (only if log level is debug)
     *
     * @param message - Log message
     * @param data - Optional structured data
     */
    debug(message, data) {
        if (this.shouldLog('debug')) {
            console.error(this.formatMessage('debug', message, data));
        }
    }
    /**
     * Log info message
     *
     * @param message - Log message
     * @param data - Optional structured data
     */
    info(message, data) {
        if (this.shouldLog('info')) {
            console.error(this.formatMessage('info', message, data));
        }
    }
    /**
     * Log warning message
     *
     * @param message - Log message
     * @param data - Optional structured data
     */
    warn(message, data) {
        if (this.shouldLog('warn')) {
            console.error(this.formatMessage('warn', message, data));
        }
    }
    /**
     * Log error message
     *
     * @param message - Log message
     * @param data - Optional structured data or Error object
     */
    error(message, data) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, data));
        }
    }
}
/**
 * Global logger instance
 *
 * Configured via XC_LOG_LEVEL environment variable.
 *
 * @example
 * ```typescript
 * logger.info('Build completed', { scheme: 'MyApp', duration: '45.2s' });
 * logger.error('Build failed', error);
 * ```
 */
export const logger = new Logger();
//# sourceMappingURL=logger.js.map