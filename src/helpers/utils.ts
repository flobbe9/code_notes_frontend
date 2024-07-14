import $ from "jquery";
import { ApiExceptionFormat } from "../abstract/ApiExceptionFormat";
import { fetchAnyReturnBlobUrl } from "./fetchUtils";
import { DEFAULT_HTML_SANTIZER_OPTIONS, ENV } from "./constants";
import { CSSProperties } from "react";
import parse, { Element } from "html-react-parser";
import sanitize from "sanitize-html";
import CryptoJS from "crypto-js";


export function log(text?: any, obj?: any, debug = false): void {

    if (!debug) 
        console.log(text);
    
    else {
        try {
            throw Error(text);
            
        } catch (e) {
            console.log(e);
        }
    }

    if (obj)
        console.log(obj);
}


export function logWarn(text?: any): void {

    try {
        throw Error(text);
        
    } catch (e) {
        console.warn(e);
    }
}


export function logError(text?: any): void {

    try {
        throw Error(text);
        
    } catch (e) {
        console.error(e);
    }
}


/**
 * Log the all props of given {@link ApiExceptionFormat} response and include the stacktrace.
 * 
 * @param response idealy formatted as {@link ApiExceptionFormat}
 */
export function logApiResponse(response: ApiExceptionFormat): void {

    logError(getTimeStamp() + " " +  response.error + "(" + response.status + "): " + response.message + (response.path ? " " + response.path : ""));
}


/**
 * @param id to find in html document, excluding the jquery prefix "#"
 * @param debug if true a warn log will be displayed in case of falsy id, default is true
 * @returns a JQuery with all matching elements or null if no results
 */
export function getJQueryElementById(id: string, debug = true): JQuery | null {

    // case: blank
    if (isBlank(id)) {
        if (debug)
            logWarn("id blank: " + id);

        return null;
    }

    const element = $("#"  + id);

    // case: not present
    if (!element.length) {
        if (debug)
            logWarn("falsy id: " + id);

        return null;
    }

    return element;
}


/**
 * @param className to find in html document, excluding the jquery prefix "."
 * @param debug if true a warn log will be displayed in case of falsy id, default is true
 * @returns a JQuery with all matching elements or null if no results
 */
export function getJQueryElementByClassName(className: string, debug = true): JQuery | null {

    // case: blank
    if (isBlank(className)) {
        if (debug)
            logWarn("className blank: " + className);
        
        return null;
    }

    const element = $("."  + className);

    // case: not present
    if (!element.length) {
        if (debug)
            logWarn("falsy className: " + className);

        return null;
    }

    return element;
}


export function stringToNumber(str: string | number | undefined): number {

    if (typeof str === "number")
        return str;
    
    try {
        return Number.parseFloat(str!);

    } catch (e) {
        logError(e);
        return -1;
    }
}


export function isNumberFalsy(num: number | null | undefined): boolean {

    return num === undefined || num === null || isNaN(num);
}


export function isBooleanFalsy(bool: boolean | null | undefined): boolean {

    return bool === undefined || bool === null;
}

export function isObjectFalsy(obj: object | null | undefined): boolean {

    return obj === undefined || obj === null || !Object.entries(obj).length;
} 

/**
 * Indicates whether given ```str``` is falsy or not. Is not the same as {@code isBlank()}!
 * 
 * @param str to check
 * @returns true if and only if given ```str === undefined || str === null```
 */
export function isStringFalsy(str: string | null | undefined): boolean {

    return str === undefined || str === null;
}


/**
 * @param str string to check
 * @returns true if given string is empty or only contains white space chars
 */
export function isBlank(str: string | undefined | null): boolean {

    if (!str && str !== "")
        return true;

    str = str.trim();

    return str.length === 0;
}


/**
 * @param str to check
 * @returns true if and only if ```str.length === 0``` is true 
 */
export function isEmpty(str: string): boolean {

    if (!str && str !== "") {
        logError("Falsy input str: " + str);
        return false;
    }

    return str.length === 0;
}


/**
 * @param length num chars the string should have
 * @returns random string of of alphanumeric chars with given length
 */
export function getRandomString(length = 12): string {

    return Math.random().toString(36).substring(2, length + 2);
}


/**
 * Insert given ```insertionString``` into given ```targetString``` after given index.
 * 
 * I.e: ```insertString("Hello", "X", 1)``` would return ```HXello```.
 * 
 * @param targetString string to insert another string into
 * @param insertionString string to insert 
 * @param insertionIndex index in ```targetString``` to insert into, i.e ```insertionIndex = 0``` would insert at the start
 * @returns result string, does not alter ```targetString```
 */
export function insertString(targetString: string, insertionString: string, insertionIndex: number): string {

    let leftHalft = targetString.substring(0, insertionIndex);
    const rightHalf = targetString.substring(insertionIndex);

    leftHalft += insertionString;

    return leftHalft + rightHalf;
}


/**
 * Move cursor a text input element. If ```start === end``` the cursor will be shifted normally to given position.
 * If ```start !== end``` the text between the indices will be marked.
 * 
 * @param textInput jquery text input element to move the cursor in
 * @param start index of selection start, default is 0
 * @param end index of selection end, default is ```start``` param
 * @param debug if true a warn log will be displayed in case of falsy id, default is true
 */
export function moveCursor(textInput: JQuery, start = 0, end = start, debug = false): void {

    if (!textInput)
        return;

    textInput.prop("selectionStart", start);
    textInput.prop("selectionEnd", end);
}


/**
 * @param textInputId of text input element to check
 * @returns the current index of the cursor of given text input element or -1. If text is marked, the index of selection start is returned
 */
export function getCursorIndex(textInputId: string): number {

    const textInput = getJQueryElementById(textInputId);

    return textInput ? textInput.prop("selectionStart") : -1;
}


function confirmPageUnloadEvent(event): void {

    event.preventDefault();
    event.returnValue = "";
}


/**
 * Create a hidden ```<a href="url" download></a>``` element, click it and remove it from the dom afterwards. Optionally handle
 * given url with {@link fetchAnyReturnBlobUrl} first.
 * Create a hidden ```<a href="url" download></a>``` element, click it and remove it from the dom afterwards. Optionally handle
 * given url with {@link fetchAnyReturnBlobUrl} first.
 * 
 * @param url to make the download request to
 * @param fileName name of file to use for download. If empty, the response header will be searched for a filename
 * @param fetchBlob if true, the given url will be handled by {@link fetchAnyReturnBlobUrl} method first, before beeing passed to ```<a></a>``` tag. 
 *                  In that case, the fileName param should be passed as well or no fileName will be specified at all.
 *                  If false, the given url will be passed directly to ```<a></a>``` tag. Http method should be "get" in that case.
 *                  Default is true
 * @param method http method to use for fetch. Default is "get"
 * @param body to send with the request
 * @param headers json object with strings as keys and values
 * @returns error response as {@link ApiExceptionFormat} if ```fetchBlob``` or nothing if all went well 
 */
export async function downloadFileByUrl(url: string, 
                                        fileName?: string, 
                                        fetchBlob = true,
                                        method = "get", 
                                        body?: object, 
                                        headers = {"Content-Type": "application/octet-stream"} 
                                        ): Promise<ApiExceptionFormat | void> {

    // case: fetch blob first
    if (fetchBlob) {
        const response = await fetchAnyReturnBlobUrl(url, method, body, headers);

        // case: successfully generated url from blob
        if (typeof response === "string")
            url = response;
        else
            return response;
    }

    // create link
    const linkElement = document.createElement('a');

    // add props
    linkElement.href = url;
    if (fileName)
        linkElement.download = fileName;

    // add props
    linkElement.href = url;
    if (fileName)
        linkElement.download = fileName;
    linkElement.style.display = 'none';

    // append
    document.body.appendChild(linkElement);
  
    // trigger link
    linkElement.click();
  
    // remove
    document.body.removeChild(linkElement);
}


/**
 * @param width of element as css value, possibly with unit appended
 * @param unitDigits to cut from width in order to get the plain number
 * @returns width in percent relative to window width as string with a '%' appended
 */
export function getElementWidthRelativeToWindow(width: string | number, unitDigits: number): string {

    const windowWidth = $(window).width();
    if (!windowWidth) {
        logError("Failed to get width in percent. 'windowWidth' is falsy");
        return "";
    }

    // NOTE: will this work if one line has not the same width as the window?
    const widhInPercent = (getCSSValueAsNumber(width.toString(), unitDigits) / windowWidth) * 100;

    return widhInPercent + "%";
}


/**
 * Confirm page refresh, tab close and window close with browser popup.<p>
 * 
 * Do nothing if ```API_ENV``` is "dev".
 */
export function confirmPageUnload(): void {

    if (ENV === "development")
        return;

    // confirm page refresh / tab close / window close
    window.addEventListener("beforeunload", confirmPageUnloadEvent);
}


export function removeConfirmPageUnloadEvent(): void {

    window.removeEventListener("beforeunload", confirmPageUnloadEvent);
}


/**
 * Remove given ```removeClass``` className from given ```element```, add given ```addClass``` and then
 * after given ```holdTime``` undo both operations.
 * 
 * @param elementId id of element to flash the className of
 * @param addClass className the element has while flashing 
 * @param removeClass className the element should loose while flashing and get back afterwards
 * @param holdTime time in ms that the border stays with given addClass and without given removeClass, default is 1000
 * @return promise that resolves once animation is finished
 */
export async function flashClass(elementId: string, addClass: string, removeClass?: string, holdTime = 1000) {

    return new Promise((res, rej) => {
        const element = getJQueryElementById(elementId);
        if (!element) {
            rej("'elementId' falsy: " + elementId);
            return;
        }
        // remove old class
        element.removeClass(removeClass);

        // add flash class shortly
        element.addClass(addClass);
        
        const resetCallback = () => {
            element.removeClass(addClass)
            element.addClass(removeClass || "");
        }

        // reset
        setTimeout(() => res(resetCallback()), holdTime);
    });
}


/**
 * Add given css object to given element for given amount of time and reset css values afterwards.
 * 
 * @param elementId id of element to flash the syle of
 * @param flashCss css object (key and value are strings) to apply to given element
 * @param holdTime time in ms to apply the styles before resetting them
 * @returns a Promise which resolves once styles are reset
 */
export async function flashCss(elementId: string, flashCss: Record<string, string>, holdTime = 1000): Promise<void> {
    
    return new Promise((res, rej) => {
        const element = getJQueryElementById(elementId);
        if (!element) {
            rej("'elementId' falsy: " + elementId);
            return;
        }

        const initCss: Record<string, string> = {};

        // set flash styles
        Object.entries(flashCss).forEach(([cssProp, cssVal]) => {
            // save init css entry
            initCss[cssProp] = element.css(cssProp);

            // set flash css value
            element.css(cssProp, cssVal);
        })

        // reset flash styles
        setTimeout(() => {
            res(
                Object.entries(initCss).forEach(([cssProp, cssVal]) => 
                    element.css(cssProp, cssVal))
            );
        }, holdTime)
    });
}


/**
 * @param str string to replace a char in
 * @param replacement string to use as replacement
 * @param startIndex of chars to replace in ```str```
 * @param endIndex of chars to replace in ```str``` (not included), default is ```str.length```
 * @returns string with replacement at given position (does not alter ```str```)
 */
export function replaceAtIndex(str: string, replacement: string, startIndex: number, endIndex = str.length): string {

    const charsBeforeIndex = str.substring(0, startIndex);
    const charsBehindIndex = str.substring(endIndex);

    return charsBeforeIndex + replacement + charsBehindIndex;
}


/**
 * @param expected first value to compare
 * @param actual second value to compare
 * @returns ```expected === actual``` after calling ```toLowerCase()``` on both values.
 *          Types wont be considered: ```"1" === 1 = true```
 */
export function equalsIgnoreCase(expected: string | number | undefined, actual: string | number | undefined): boolean {

    if (!expected || !actual)
        return expected === actual;

    expected = expected.toString().toLowerCase();
    actual = actual.toString().toLowerCase();

    return expected === actual;
}


/**
 * @param expected first value to compare
 * @param actual second value to compare
 * @returns ```expected === actual``` after calling ```trim()``` and ```toLowerCase()``` on both values.
 *          Types wont be considered: ```"1" === 1 = true```
 */
export function equalsIgnoreCaseTrim(expected: string | number, actual: string | number): boolean {

    if (!expected || !actual)
        return expected === actual;

    expected = expected.toString().trim().toLowerCase();
    actual = actual.toString().trim().toLowerCase();

    return expected === actual;
}


/**
 * @param arr array to search in
 * @param value string or number to look for
 * @returns true if value is included in array. Uses {@link equalsIgnoreCase} for comparison instead of ```includes()```.
 */
export function includesIgnoreCase(arr: (string | number)[] | string, value: string | number): boolean {

    // case: arr is string
    if (typeof arr === "string")
        return arr.toLowerCase().includes(value.toString().toLowerCase());

    const result = arr.find(val => equalsIgnoreCase(val, value));

    return result ? true : false;
}


/**
 * @param arr array to search in
 * @param value string or number to look for
 * @returns true if value is included in array. Uses {@link equalsIgnoreCaseTrim} for comparison instead of ```includes()```.
 */
export function includesIgnoreCaseTrim(arr: (string | number)[] | string, value: string | number): boolean {
        
    // case: arr is string
    if (typeof arr === "string")
        return arr.trim().toLowerCase().includes(value.toString().trim().toLowerCase());

    const result = arr.find(val => equalsIgnoreCaseTrim(val, value));

    return result ? true : false;
}


/**
 * @param str to check 
 * @param regexp pattern to use for checking
 * @returns true if and only if all chars in given string match given pattern, else false
 */
export function matchesAll(str: string, regexp: RegExp): boolean {

    // iterate chars
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        
        if (char.match(regexp) === null)
            return false;
    }

    return true;
}


export function isStringAlphaNumeric(str: string): boolean {

    // alpha numeric regex
    const regexp = /^[a-z0-9ßäÄöÖüÜ]+$/i;

    return matchString(str, regexp);
}


/**
 * @param str to check
 * @returns true if every char of given string matches regex. Only alphabetical chars including german exceptions
 *          'ßäÄöÖüÜ' are a match (case insensitive).
 */
export function isStringAlphabetical(str: string): boolean {

    // alpha numeric regex
    const regexp = /^[a-zßäÄöÖüÜ]+$/i;

    return matchString(str, regexp);
}


/**
 * @param str to check
 * @param considerDouble if true, ',' and '.' will be included in the regex
 * @returns true if every char of given string matches the numeric regex
 */
export function isStringNumeric(str: string, considerDouble = false): boolean {

    // alpha numeric regex
    let regexp = /^[0-9]+$/;

    if (considerDouble)
        regexp = /^[0-9.,]+$/;

    return matchString(str, regexp);
}


export function setCssConstant(variableName: string, value: string): void {

    document.documentElement.style.setProperty("--" + variableName, value);
}


/**
 * @param variableName the variable name without the double dashes in front
 * @returns the value of the given css variable as defined in ```:root```
 */
export function getCssConstant(variableName: string): string {

    return getComputedStyle(document.documentElement).getPropertyValue("--" + variableName);
}


/**
 * Cut given number of digits from cssValue and try to parse substring to number.
 * 
 * @param cssValue css value e.g: 16px
 * @param unitDigits number of digigts to cut of cssValue string
 * @returns substring of cssValue parsed to number or NaN if parsing failed
 */
export function getCSSValueAsNumber(cssValue: string | number, unitDigits: number): number {

    // case: is a number already
    if (typeof cssValue === "number")
        return cssValue;

    // case: no value
    if (isBlank(cssValue))
        return NaN;

    const length = cssValue.length;
    if (unitDigits >= length) {
        // case: is numeric
        if (isStringNumeric(cssValue, true))
            return stringToNumber(cssValue);

        logError("Failed to get css value as number. 'unitDigits' (" + unitDigits + ") too long or 'cssValue' (" + cssValue + ") too short.");
    }

    const endIndex = cssValue.length - unitDigits;

    return stringToNumber(cssValue.substring(0, endIndex));
}


/**
 * @param str to check
 * @param regexp to use for matching
 * @returns true if every char of string matches the regex, trims the string first
 */
function matchString(str: string, regexp: RegExp): boolean {

    str = str.trim();

    let matches = true;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char.match(regexp) === null) {
            matches = false;
            break;
        }
    }

    return matches
}


/**
 * Makes user confirm and prevents default event if confirm alert was canceld. Only confirm if 
 * current location matches at least one of ```props.pathsToConfirm```.<p>
 * 
 * Do nothing if ```API_ENV``` is "dev"
 * 
 * @param currentPath path of current url
 * @param pathsToConfirm list of paths that should use the confirm popup
 * @param event that triggered the navigation
 */
export function confirmNavigateEvent(currentPath: string, pathsToConfirm: string[], event: any): void {

    if (ENV === "development")
        return;

    const confirmLeaveMessage = "Seite verlassen? \nVorgenommene Änderungen werden unter Umständen nicht gespeichert."

    if (pathsToConfirm.includes(currentPath) && !window.confirm(confirmLeaveMessage))
        event.preventDefault();
}


/**
 * Makes user confirm and prevents default event if confirm alert was canceld. Only confirm if 
 * currentPath matches at least one of ```props.pathsToConfirm```, else simply excute the callback without confirmation.
 * 
 * @param currentPath path of current url
 * @param callback optional. Execute on confirm
 * @param pathsToConfirm list of paths that should use the confirm popup
 */
export function confirmNavigateCallback(currentPath: string, callback?: () => any, ...pathsToConfirm: string[]): void {

    const confirmLeaveMessage = "Seite verlassen? \nVorgenommene Änderungen werden unter Umständen nicht gespeichert."

    if (pathsToConfirm.includes(currentPath) && !window.confirm(confirmLeaveMessage))
        return;

    if (callback)
        callback();
}


/**
 * Call given callback function inside try catch block and return ```null``` if error is caught.
 * 
 * @param callback function without params that is called inside try catch
 * @param debug if true the error will be logged. Default is false
 * @returns the callbacks return value or null in case of error
 */
export function tryCatchReturnNull(callback: () => any, debug = false): any {

    try {
        return callback();

    } catch (e) {
        if (debug) 
            logError(e);
    
        return null;
    }
}


/**
 * Call given callback function inside try catch block and return nothing if error is caught.
 * 
 * @param callback function without params that is called inside try catch
 * @param debug if true the error will be logged. Default is false
 * @returns the callbacks return value or nothing in case of error
 */
export function tryCatchReturnNothing(callback: () => any, debug = false): any {

    try {
        return callback();

    } catch (e) {
        if (debug) 
            logError(e);
    }
}


/**
 * @param debug if true, given message will be logged
 * @param message to log if debug is true
 * @returns null
 */
export function logReturnNull(debug: boolean, message?: string): null {

    if (debug)
        logError(message || "No message");

    return null;
}


/**
 * @param debug if true, given message will be logged
 * @param message to log if debug is true
 */
export function logReturnNothing(debug: boolean, message?: string): void {

    if (debug)
        logError(message || "No message");
}


export function dateEquals(d1: Date | undefined, d2: Date | undefined): boolean {
    
    // check undefined
    if (!d1) {
        if (d2)
            return false;

        return true;

    } else if (!d2)
        return false;

    // copy to new object, dont consider time
    const date1 = stripTimeFromDate(new Date(d1));
    const date2 = stripTimeFromDate(new Date(d2));
    
    return date1.getTime() === date2.getTime();
}


/**
 * @param date date that is supposedly before ```otherDate```
 * @param otherDAte date that is supposedly after ```date```
 * @returns true if ```date``` is before ```otherDate``` (not equal). Ignores time and uses only date
 */
export function isDateBefore(date: Date, otherDate: Date): boolean {

    const date1 = stripTimeFromDate(new Date(date));
    const date2 = stripTimeFromDate(new Date(otherDate));

    return date1 < date2;
}


/**
 * @param date date that is supposedly after ```otherDate```
 * @param otherDAte date that is supposedly before ```date```
 * @returns true if ```date``` is after ```otherDate``` (not equal). Ignores time and uses only date
 */
export function isDateAfter(date: Date, otherDate: Date): boolean {

    const date1 = stripTimeFromDate(new Date(date));
    const date2 = stripTimeFromDate(new Date(otherDate));

    return date1 > date2;
}


export function datePlusYears(years: number, date = new Date()): Date {

    if (isNumberFalsy(years))
        return date;

    const alteredDate = new Date(date);
    const dateYears = alteredDate.getFullYear();
    alteredDate.setFullYear(dateYears + years);

    return alteredDate;
}


export function datePlusDays(days: number, date = new Date()): Date {

    if (isNumberFalsy(days))
        return date;

    const alteredDate = new Date(date);
    const dateDays = alteredDate.getDate();
    alteredDate.setDate(dateDays + days);

    return alteredDate;
}


export function dateMinusDays(days: number, date = new Date()): Date {

    if (isNumberFalsy(days))
        return date;

    const alteredDate = new Date(date);
    const dateDays = alteredDate.getDate();
    alteredDate.setDate(dateDays - days);

    return alteredDate;
}


export function stripTimeFromDate(d: Date): Date {

    const date = new Date(d);

    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(0);
    date.setHours(0);

    return date;
}


/**
 * Parse given css string to valid css object formatted for react. This means dashes in keys are replaced and keys
 * will use camel case.
 * 
 * @param cssString string using css syntax like in .css files. E.g. "margin: 0; box-shadow: black"
 * @returns css object for react
 */
export function parseCSSStringToJson(cssString: string): CSSProperties {

    const cssObject = {};

    // array with key value pairs like ["key": "value", "key2": "value2"]
    const cssKeyValues = cssString.split(";");
    for (let i = 0; i < cssKeyValues.length; i ++) {
        const keyValue = cssKeyValues[i].split(":");
        const key = keyValue[0];
        const value = keyValue[1];

        let newKey = "";
        let newValue = value;

        // iterate chars of key
        for (let j = 0; j < key.length; j++) {
            const char = key.charAt(j);
            if (char === "-") {
                // remove dash, set next char to upperCase
                const nextChar = key.charAt(j + 1);
                newKey = replaceAtIndex(key, nextChar.toUpperCase(), j, j + 2)
            }
        }

        // clean up key and value
        newKey = newKey.replace(":", "");
        newValue = newValue.replace(";", "").trim();

        cssObject[newKey] = newValue;
    }

    return cssObject;
}

    

/**
 * Parse given html string and retrieve some attribs.
 * 
 * @param dirtyHtml unsafe html to parse
 * @returns some attributes of the innerHtml of the core/columns block
 */
export function getHTMLStringAttribs(dirtyHtml: string): {className: string, id: string, style: string} {

    let className = "";
    let id = "";
    let style = "";

    // parse html
    parse(sanitize(dirtyHtml, DEFAULT_HTML_SANTIZER_OPTIONS), {
        replace(domNode: Element) {

            // get attributes
            const attribs = domNode.attribs;
            if (!attribs)
                return;

            className = attribs.class;
            id = attribs.id;
            style = attribs.style
        }
    })

    return {
        className,
        id,
        style
    }
}


/**
 * @param date to format, default is ```new Date()```
 * @returns nicely formatted string formatted like ```year-month-date hours:minutes:seconds:milliseconds```
 */
function getTimeStamp(date = new Date()): string {

    return date.getFullYear() + "-" + prepend0ToNumber(date.getMonth() + 1) + "-" + prepend0ToNumber(date.getDate()) + " " + 
           prepend0ToNumber(date.getHours()) + ":" + prepend0ToNumber(date.getMinutes()) + ":" + prepend0ToNumber(date.getSeconds()) + ":" + date.getMilliseconds();
}


/**
 * @param num to prepend a 0 to
 * @returns a string representation of given number with a 0 prended if the number has only one digit
 */
function prepend0ToNumber(num: number): string {

    let str = num.toString();

    // case: one digit only
    if (num / 10 < 1)
        str = "0" + str;

    return str;
}


/**
 * @param value to generate a hash for
 * @param config to pass to hash function
 * @returns ```toString()``` call on the generated ```CryptoJS.lib.WordArray```
 */
export function hash(value: CryptoJS.lib.WordArray | string, config?: object): string {

    return CryptoJS.SHA256(value, config).toString();
}


/**
 * @param date to generate a hash for
 * @returns ```this.hash()``` with the time stripped from the date and then passing ```date.getTime()``` to the hash function
 */
export function hashDate(date = new Date()): string {

    return hash(stripTimeFromDate(date).getTime().toString());
}