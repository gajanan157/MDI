/**
 * Centralized logging utility
 * Allows conditional logging based on environment
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Safe logger that only logs in development
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors

    console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
