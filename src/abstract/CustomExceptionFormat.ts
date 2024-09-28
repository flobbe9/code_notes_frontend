/**
 * Interface defining the format of an http error object.
 * 
 * @since 0.0.1
 */
export interface CustomExceptionFormat {

    status: number;

    timestamp: string;

    message: string;

    path: string;
}