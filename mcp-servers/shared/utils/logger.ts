/**
 * Simple logger for tools
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVEL = process.env.XC_LOG_LEVEL || 'info';

const LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] <= LEVELS[LOG_LEVEL as LogLevel];
}

export const logger = {
  error(message: string, error?: Error) {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  },

  warn(message: string, context?: unknown) {
    if (shouldLog('warn')) {
      console.error(`[WARN] ${message}`, context || '');
    }
  },

  info(message: string, context?: unknown) {
    if (shouldLog('info')) {
      console.error(`[INFO] ${message}`, context || '');
    }
  },

  debug(message: string, context?: unknown) {
    if (shouldLog('debug')) {
      console.error(`[DEBUG] ${message}`, context || '');
    }
  },
};
