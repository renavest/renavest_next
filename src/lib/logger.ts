import { Result, ok } from 'neverthrow';
import winston from 'winston';

// Log levels with numeric severity
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create a custom logger with multiple transports
const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    // Optional file transport for production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'combined.log',
          }),
        ]
      : []),
  ],
});

// Wrapper for logging methods that returns a Result
function logAndReturn<T, E = Error>(
  level: keyof typeof LOG_LEVELS,
  message: string,
  meta?: Record<string, unknown>,
): (input: T) => Result<T, E> {
  return (input: T) => {
    logger[level](message, meta);
    return ok(input);
  };
}

export const logUtils = {
  info: (message: string, meta?: Record<string, unknown>) => logAndReturn('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => logAndReturn('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => logAndReturn('error', message, meta),
};

export default logger;
