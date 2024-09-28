import { getTimeStamp, isNumberFalsy, log, logApiResponse } from "./utils";
import { CustomExceptionFormat } from '../abstract/CustomExceptionFormat';
import { BACKEND_BASE_URL, CSRF_TOKEN_HEADER_NAME } from "./constants";
import { CSRF_TOKEN_LOCAL_STORAGE_KEY } from "../components/Login";
import CryptoJSImpl from "../abstract/CryptoJSImpl";
import { CustomExceptionFormatService } from "../services/CustomExceptionFormatService";


/** Http status code "Service Unavailable" 503, use this status when ```fetch()``` throws "failed to fetch" error */
export const FAILED_TO_FETCH_STATUS_CODE = 503;


/**
 * Call ```fetchAny``` with given params.
 * 
 * @param url to send the request to
 * @param method http request method, default is "get"
 * @param body (optional) to add to the request
 * @param headers json object with strings as keys and values
 * @param debug if ```true```, a response with a bad status code will be logged. Default is ```true```
 * @returns response as json
 */
export default async function fetchJson(url: string, method = "get", body?: any, headers?: HeadersInit, debug = true): Promise<CustomExceptionFormat | any> {

    const response = await fetchAny(url, method, body, headers, debug);

    // case: failed to fetch, already streamed to json
    if (!isHttpStatusCodeAlright(response.status)) {
        // case: actually did not stream response to json just yet 
        if (!debug && response instanceof Response)
            return await response.json() as CustomExceptionFormat;

        return response as CustomExceptionFormat;
    }

    return await (response as Response).json();
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
export async function fetchAny(url: string, method = "get", body?: any, headers?: HeadersInit, debug = true): Promise<Response | CustomExceptionFormat> {
    
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
export async function fetchAnyReturnBlobUrl(url: string, method = "get", body?: object, headers?: HeadersInit): Promise<string | CustomExceptionFormat> {

    const response = await fetchAny(url, method, body, headers);

    // case: request failed
    if (!isHttpStatusCodeAlright(response.status))
        return response as CustomExceptionFormat;

    const blob = await (response as Response).blob();

    // case: falsy blob
    if (!blob) {
        const error = CustomExceptionFormatService.getInstance(
            406, // not acceptable
            "Failed to get blob from response."
        );

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
 * @param response to check if is error
 * @returns ```true``` if given response is truthy, has a ```status``` field and that ```status``` field is not "alright" (see {@link isHttpStatusCodeAlright})
 */
export function isResponseError(response: any): response is CustomExceptionFormat {

    return response && !isNumberFalsy(response.status) && !isHttpStatusCodeAlright(response.status);
}


/**
 * Set content type to "application/json" if not present.
 * 
 * Also set csrf token if present (or an empty string if not).
 * 
 * @param headers json object with strings as keys and values
 * @returns ```headers``` object with necessary props set 
 */
function getFetchHeaders(headers?: HeadersInit): HeadersInit {

    const contentType = {"Content-Type": "application/json"};

    if (!headers)
        headers = {};

    // content type
    if (!headers["Content-Type"])
        Object.assign(headers, contentType);

    // csrf
    headers = {...headers, [CSRF_TOKEN_HEADER_NAME]: getCsrfTokenDecrypted()}

    return headers!;
}


/**
 * @returns the decrypted csrf token from localstorage or an empty string
 */
function getCsrfTokenDecrypted(): string {

    const encrpytedCsrf = localStorage.getItem(CSRF_TOKEN_LOCAL_STORAGE_KEY);

    // case: no csrf token present
    if (!encrpytedCsrf)
        return "";

    return new CryptoJSImpl().decrypt(encrpytedCsrf);
}


/**
 * Format given fetch error as {@link CustomExceptionFormat}, log and return it.
 * 
 * @param e fetch error that was thrown 
 * @param url that fetch() used
 * @returns {@link CustomExceptionFormat} using most values from given error
 */
function handleFetchError(e: Error, url: string): CustomExceptionFormat {

    const error = CustomExceptionFormatService.getInstance(500, e.message);
    error.path = url.replace(BACKEND_BASE_URL, "")

    logApiResponse(error);

    return error;
}