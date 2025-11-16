/**
 * NOTE: order of values represents priority, dont change.
 * @since latest
 * @see 'logUtils.ts'
 */
export enum LogLevel {
    FATAL,
    ERROR,
    WARN,
    INFO,
    DEBUG,
    TRACE
}

const logLevelNames = {
    [LogLevel.FATAL]: 'FATAL',
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.TRACE]: 'TRACE'
};

export function logLevelToString(logLevel: LogLevel): string {
    return logLevelNames[logLevel];
}
