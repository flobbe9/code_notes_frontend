import { getTimeStamp } from "../helpers/utils";

/**
 * Interface defining the format of an http error object.
 * 
 * @since 0.0.1
 */
export class CustomExceptionFormat {

    status: number;

    timestamp: string;

    message: string;

    path: string;


    constructor(status: number, timestamp: string, message: string, path: string) {

        this.status = status;
        this.timestamp = timestamp;
        this.message = message;
        this.path = path;
    }


    /**
     * @param status 
     * @param message 
     * @returns instance using "now" as timestamp and the current ```window.location.pathname``` as path
     */
    public static getInstance(status: number, message: string): CustomExceptionFormat {

        return new CustomExceptionFormat(
            status, 
            getTimeStamp(),
            message,
            window.location.pathname
        )
    }
}