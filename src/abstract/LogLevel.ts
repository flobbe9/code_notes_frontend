import { ENV, LOG_LEVEL } from "../helpers/constants";
import { logWarn } from "../helpers/utils";

/**
 * Applies to custom "log" methods in "utils.ts".
 *  
 * @since 0.0.4
 */


const logLevelDef = {
    "ERROR": 0,
    "WARN": 1,
    "INFO": 2,
    "DEBUG": 3,
}


export type LogLevelName = keyof typeof logLevelDef;


export function isLogLevelName(name: string | undefined | null): name is LogLevelName {

    return !!name && Object.keys(logLevelDef).includes(name);
}


function isLogLevel(expectedLogLevel: LogLevelName): boolean {

    if (!isLogLevelName(LOG_LEVEL)) {
        // don't use custom log method here since they depend on a valid LOG_LEVEL
        console.error("Invalid 'LOG_LEVEL'");
        return false;
    }

    return logLevelDef[LOG_LEVEL] >= logLevelDef[expectedLogLevel];
}


export function isErrorLogLevel(): boolean {

    return isLogLevel("ERROR");
}


export function isWarnLogLevel(): boolean {

    return isLogLevel("WARN");
}


export function isInfoLogLevel(): boolean {

    return isLogLevel("INFO");
}


/**
 * @returns ```false``` if {@link ENV} is "production"
 */
export function isDebugLogLevel(): boolean {

    if ("production" === ENV) {
        logWarn("Cannot log at 'DEBUG' level in 'production'");
        return false;
    }

    return isLogLevel("DEBUG");
}