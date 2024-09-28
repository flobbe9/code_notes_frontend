import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { getTimeStamp } from "../helpers/utils";


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
}