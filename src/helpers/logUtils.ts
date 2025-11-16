import { CustomExceptionFormat } from '../abstract/CustomExceptionFormat';
import { LogLevel, logLevelToString } from '../abstract/LogLevel';
import { ENV, LOG_LEVEL } from './constants';
import { getTimeStamp } from './utils';

/**
 * Call the corresponding `console[logLevel]` method.
 *
 * NOTE: not touching `conosle.log`
 *
 * @param logLevel
 * @param optionalParams
 * @returns
 */
function logByLogLevel(logLevel: LogLevel, ...optionalParams: any[]): void {
    if (!isLogLevel(logLevel)) return;

    let jsLogLevel = logLevelToString(logLevel).toLowerCase();
    if (logLevel === LogLevel.FATAL)
        jsLogLevel = logLevelToString(LogLevel.ERROR).toLowerCase();
    
    // prevent annoying stack trace
    if (logLevel === LogLevel.TRACE)
        jsLogLevel = logLevelToString(LogLevel.DEBUG).toLowerCase();

    console[jsLogLevel](getLogStartOfLine(logLevel), ...optionalParams);
}

export function logError(message?: any, ...optionalParams: any[]): void {
    if (message instanceof Error) message = message.message;

    logByLogLevel(LogLevel.ERROR, message, ...optionalParams);
}

export function logWarn(message?: any, ...optionalParams: any[]): void {
    logByLogLevel(LogLevel.WARN, message, ...optionalParams);
}

export function logInfo(message?: any, ...optionalParams: any[]): void {
    logByLogLevel(LogLevel.INFO, message, ...optionalParams);
}

export function logDebug(message?: any, ...optionalParams: any[]): void {
    logByLogLevel(LogLevel.DEBUG, message, ...optionalParams);
}

export function logTrace(message?: any, ...optionalParams: any[]): void {
    logByLogLevel(LogLevel.TRACE, message, ...optionalParams);
}

export function log(...optionalParams: any[]): void {
    console.log(...optionalParams);
}

/**
 * Log the all props of given {@link CustomExceptionFormat} response and include the stacktrace.
 *
 * @param response idealy formatted as {@link CustomExceptionFormat}
 */
export function logApiResponse(response: CustomExceptionFormat): void {
    logError(response.timestamp + ' (' + response.status + '): ' + response.message + (response.path ? ' ' + response.path : ''));
}

/**
 * Indicates whether `logLevel` is matching {@link LOG_LEVEL}, meaning that logs with that level would
 * be enabled.
 *
 * Make sure not to debug or trace in production (use {@link APP_ENV})
 *
 * NOTE: dont use custom log methods here to prevent cycle.
 *
 * @param logLevel
 * @returns `true` if `logLevel` ordianl value is less than equal {@link LOG_LEVEL}
 */
function isLogLevel(logLevel: LogLevel): boolean {
    if (isNonProductionLogLevel(logLevel) && ENV === 'production') {
        console.warn(getLogStartOfLine(logLevel), `Wont log at '${logLevelToString(logLevel)}' log level in production!`);
        return false;
    }

    return LOG_LEVEL >= logLevel;
}

function isNonProductionLogLevel(logLevel: LogLevel): boolean {
    const nonProductionLogLevels = new Set([LogLevel.DEBUG, LogLevel.TRACE]);

    return nonProductionLogLevels.has(logLevel);
}

/**
 * Log the timestamp before every log entry.
 *
 * @param logLevel
 * @returns the string the log entry should start with
 */
export function getLogStartOfLine(logLevel: LogLevel): string {
    return `[${logLevelToString(logLevel)}] ${getTimeStamp()}`;
}
