/**
 * Interface defining the format of an http error object.
 * 
 * @since 0.0.1
 */
export class CustomExceptionFormat {

    status: number;

    error: string | null;

    message: string;

    path: string;


    constructor(status: number, error: string | null, message: string, path: string) {

        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }
}