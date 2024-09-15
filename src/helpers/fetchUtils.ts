import { isNumberFalsy, log, logApiResponse } from "./utils";
import { CustomExceptionFormat } from '../abstract/CustomExceptionFormat';
import { BACKEND_BASE_URL } from "./constants";


/** Http status code "Service Unavailable" 503, use this status when ```fetch()``` throws "failed to fetch" error */
export const FAILED_TO_FETCH_STATUS_CODE = 503;


/**
 * Call ```fetchAny``` with given params.
 * 
 * @param url to send the request to
 * @param method http request method, default is "get"
 * @param body (optional) to add to the request
 * @param headers json object with strings as keys and values
 * @returns response as json
 */
export default async function fetchJson<ResponseType>(url: string, method = "get", body?: any, headers?: object): Promise<CustomExceptionFormat | ResponseType> {

    const response = await fetchAny(url, method, body, headers);

    // case: failed to fetch, already streamed to json
    if (!isHttpStatusCodeAlright(response.status))
        return response as CustomExceptionFormat;

    return await (response as Response).json() as ResponseType;
}


/**
 * Sends an http request using given url, method and body. Will only log fetch errors.<p>
 * 
 * Fetch errors will be returned as {@link CustomExceptionFormat}.<p>
 * 
 * @param url to send the request to
 * @param method http request method, default is "get"
 * @param body (optional) to add to the request
 * @param headers json object with strings as keys and values
 * @param debug if true, a response with a bad status code will be read to ```.json()``` and logged. Default is true
 * @returns a promise with the response or an {@link CustomExceptionFormat} object in it
 */
export async function fetchAny(url: string, method = "get", body?: any, headers?, debug = true): Promise<Response | CustomExceptionFormat> {
    
    // set headers
    const fetchConfig: RequestInit = {
        method: method,
        headers: await getFetchHeaders(headers),
        credentials: "include"
    }

    // case: request has body
    if (body) 
        fetchConfig.body = JSON.stringify(body);

    // send request
    try {
        const response = await fetch(url, fetchConfig);

        // case: request failed
        if (!isHttpStatusCodeAlright(response.status) && debug) 
            logApiResponse(await response.json());
        
        return response;

    // case: failed to fetch
    } catch(e) {
        return handleFetchError(e, url);
    }
}


/**
 * Fetch content from givn url and call ```URL.createObjectURL(response.blob())``` on it.
 * 
 * @param url to send the request to
 * @param method http request method, default is "get"
 * @param body (optional) to add to the request
 * @param headers json object with strings as keys and values
 * @returns a Promise with a url object containing the blob, that can be downloaded with an ```<a></a>``` tag. If error, return
 *          {@link CustomExceptionFormat} object
 */
export async function fetchAnyReturnBlobUrl(url: string, method = "get", body?: object, headers?: any): Promise<string | CustomExceptionFormat> {

    const response = await fetchAny(url, method, body, headers);

    // case: request failed
    if (!isHttpStatusCodeAlright(response.status))
        return response as CustomExceptionFormat;

    const blob = await (response as Response).blob();

    // case: falsy blob
    if (!blob) {
        const error: CustomExceptionFormat = {
            status: 406, // not acceptable
            error: null,
            message: "Failed to get blob from response.",
            path: url.replace(BACKEND_BASE_URL, "")
        }

        logApiResponse(error);

        return error;
    }

    return URL.createObjectURL(blob);
}


/**
 * @param statusCode http status code to check
 * @returns true if status code is informational (1xx), successful (2xx) or redirectional (3xx), else false
 */
export function isHttpStatusCodeAlright(statusCode: number): boolean {

    const firstDigit = Math.floor(statusCode / 100)

    return firstDigit === 1 || firstDigit === 2 ||  firstDigit === 3;
}


/**
 * @param jsonResponse to check if is error
 * @returns ```true``` if given jsonResponse is of type ```CustomExceptionFormat``` and will infer that ```jsonResponse``` if so
 */
export function isJsonResponseError(jsonResponse: any): jsonResponse is CustomExceptionFormat {

    return jsonResponse === undefined || !isNumberFalsy(jsonResponse.status);
}


/**
 * Set content type to "application/json" if not present.
 * 
 * @param headers json object with strings as keys and values
 * @returns ```headers``` object with necessary props set 
 */
async function getFetchHeaders(headers?: Record<string, any>) {

    const contentType = {"Content-Type": "application/json"};

    if (!headers)
        headers = {};

    // content type
    if (!headers["Content-Type"])
        Object.assign(headers, contentType);

    return headers;
}


/**
 * Format given fetch error as {@link CustomExceptionFormat}, log and return it.
 * 
 * @param e fetch error that was thrown 
 * @param url that fetch() used
 * @returns {@link CustomExceptionFormat} using most values from given error
 */
function handleFetchError(e: Error, url: string): CustomExceptionFormat {

    const error: CustomExceptionFormat = {
        status: FAILED_TO_FETCH_STATUS_CODE,
        error: e.toString(),
        message: e.message,
        path: url.replace(BACKEND_BASE_URL, "")
    }

    logApiResponse(error);

    return error;
}