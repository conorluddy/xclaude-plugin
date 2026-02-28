/**
 * Simple logger for tools
 */
const LOG_LEVEL = process.env.XC_LOG_LEVEL || 'info';
const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
function shouldLog(level) {
    return LEVELS[level] <= LEVELS[LOG_LEVEL];
}
export const logger = {
    error(message, error) {
        if (shouldLog('error')) {
            console.error(`[ERROR] ${message}`, error || '');
        }
    },
    warn(message, context) {
        if (shouldLog('warn')) {
            console.error(`[WARN] ${message}`, context || '');
        }
    },
    info(message, context) {
        if (shouldLog('info')) {
            console.error(`[INFO] ${message}`, context || '');
        }
    },
    debug(message, context) {
        if (shouldLog('debug')) {
            console.error(`[DEBUG] ${message}`, context || '');
        }
    },
};
