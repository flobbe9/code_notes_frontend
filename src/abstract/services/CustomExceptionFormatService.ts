import { logApiResponse } from "../../helpers/logUtils";
import { getTimeStamp } from "../../helpers/utils";
import { CustomExceptionFormat } from "../CustomExceptionFormat";


/**
 * @since 0.0.1
 */
export class CustomExceptionFormatService {
    
    /**
     * @param status 
     * @param message 
     * @returns instance using "now" as timestamp and the current ```window.location.pathname``` as path
     */
    public static getInstance(status: number, message: string): CustomExceptionFormat {
        return {
            status: status, 
            timestamp: getTimeStamp(),
            message: message,
            path: window.location.pathname
        }
    }
        

    /**
     * Will log instance. See {@link logApiResponse}.
     * 
     * @param status 
     * @param message 
     * @returns instance using "now" as timestamp and the current ```window.location.pathname``` as path
     */
    public static getInstanceAndLog(status: number, message: string): CustomExceptionFormat {
        const instance = {
            status: status, 
            timestamp: getTimeStamp(),
            message: message,
            path: window.location.pathname
        }

        logApiResponse(instance);

        return instance;
    }
}