/**
 * Simple logger for MCP server
 *
 * Logs to stderr (required by MCP protocol - stdout is reserved for protocol messages).
 * Respects XC_LOG_LEVEL environment variable: debug, info, warn, error
 */
import type { LogData } from '../types.js';
declare class Logger {
    private level;
    constructor();
    private shouldLog;
    private formatMessage;
    /**
     * Log debug message (only if log level is debug)
     *
     * @param message - Log message
     * @param data - Optional structured data
     */
    debug(message: string, data?: LogData): void;
    /**
     * Log info message
     *
     * @param message - Log message
     * @param data - Optional structured data
     */
    info(message: string, data?: LogData): void;
    /**
     * Log warning message
     *
     * @param message - Log message
     * @param data - Optional structured data
     */
    warn(message: string, data?: LogData): void;
    /**
     * Log error message
     *
     * @param message - Log message
     * @param data - Optional structured data or Error object
     */
    error(message: string, data?: LogData): void;
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
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map