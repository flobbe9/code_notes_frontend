import $ from "jquery";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { fetchAnyReturnBlobUrl } from "./fetchUtils";
import { BASE_URL, CONSOLE_MESSAGES_TO_AVOID, DEFAULT_HTML_SANTIZER_OPTIONS, ENV, LOG_SEVIRITY_COLORS, LogSevirity } from "./constants";
import { CSSProperties } from "react";
import parse, { Element } from "html-react-parser";
import sanitize from "sanitize-html";
import { useQueryClientObj } from "..";
import { APP_USER_QUERY_KEY } from "../hooks/useAppUser";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { NOTE_QUERY_KEY } from "../hooks/useNote";


export function log(message?: any, ...optionalParams: any[]): void {

    console.log(message, ...optionalParams);
}


export function logDebug(message?: any, ...optionalParams: any[]): void {

    console.log(new Error(message), ...optionalParams);
}


export function logWarn(message?: any, ...optionalParams: any[]): void {

    console.warn(new Error(message), ...optionalParams);
}


export function logWarnFiltered(message?: any, ...optionalParams: any[]): void {

    logFiltered("warn", message, ...optionalParams);
}


export function logError(message?: any, ...optionalParams: any[]): void {

    console.error(Error(message), ...optionalParams);
}


export function logErrorFiltered(message?: any, ...optionalParams: any[]): void {

    logFiltered("error", message, ...optionalParams);
}


/**
 * Dont log given ```obj``` if it contains one of {@link CONSOLE_MESSAGES_TO_AVOID}s strings. Log normally if ```obj``` is not
 * of type ```string```, ```number``` or ```Error```.
 * 
 * @param sevirity of obj to choose text background color
 * @param obj to filter before logging
 * @param optionalParams 
 */
function logFiltered(sevirity: LogSevirity, obj?: any, ...optionalParams: any[]): void {

    let messageToCheck = obj;

    // case: cannot filter obj
    if (!obj || (typeof obj !== "string" && typeof obj !== "number" && !(obj instanceof Error))) {
       logColored(sevirity, obj, ...optionalParams);
       return;
    }

    // case: Error
    if (obj instanceof Error)
        messageToCheck = obj.stack;

    // compare to avoid messages
    for (const messageToAvoid of CONSOLE_MESSAGES_TO_AVOID) 
        // case: avoid obj
        if (includesIgnoreCaseTrim(messageToCheck, messageToAvoid)) 
            return; 
        
    logColored(sevirity, messageToCheck, ...optionalParams);
}


function logColored(sevirity: LogSevirity, obj?: any, ...optionalParams: any[]): void {

    // get log color by sevirity
    const color = LOG_SEVIRITY_COLORS[sevirity];

    log("%c" + obj, "background: " + color, ...optionalParams);
}


/**
 * Log the all props of given {@link CustomExceptionFormat} response and include the stacktrace.
 * 
 * @param response idealy formatted as {@link CustomExceptionFormat}
 */
export function logApiResponse(response: CustomExceptionFormat): void {

    logError(response.timestamp + " (" + response.status + "): " + response.message + (response.path ? " " + response.path : ""));
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

export function isArrayFalsy(array: any[] | null | undefined): boolean {

    return array === undefined || array === null;
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
 * @returns error response as {@link CustomExceptionFormat} if ```fetchBlob``` or nothing if all went well 
 */
export async function downloadFileByUrl(url: string, 
                                        fileName?: string, 
                                        fetchBlob = true,
                                        method = "get", 
                                        body?: object, 
                                        headers = {"Content-Type": "application/octet-stream"} 
                                        ): Promise<CustomExceptionFormat | void> {

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
 * @param text to measure
 * @param fontSize of text, unit should be included
 * @param fontFamily of text
 * @param fontWeight of text, default is "normal"
 * @returns width of text in px
 */
export function getTextWidth(text: string, fontSize: string, fontFamily: string, fontWeight = "400"): number {

    if (isEmpty(text))
        return 0;

    // create hidden inputDiv
    let hiddenInputDiv = $(
        `<div
            id="hiddenInputDivElement"
            style='
                border: none; 
                width: fit-content;
                font-size: ${fontSize};
                font-family:  ${fontFamily};
                font-weight: ${fontWeight};
            ' 
            contenteditable
        >
            ${text}
        </div>`
    );
    
    // render
    $("body").append(hiddenInputDiv);
    hiddenInputDiv = $("#hiddenInputDivElement");

    // get width
    const hiddenInputDivWidth = (hiddenInputDiv.width());

    // clean up
    $(hiddenInputDiv).remove();    

    return hiddenInputDivWidth || 0;
}


/**
 * Confirm page refresh, tab close and window close with browser popup. Will show browser confirm alert first, 
 * then execute given callback.
 * 
 * Do nothing if ```API_ENV``` is "dev".
 * 
 * @param callback with "beforeunload" event param to execute after default has been prevnted
 * @param dontConfirmInDev indicates whether to avoid confirm alert if env is "development". Defautl is ```true```
 */
export function confirmPageUnload(callback?: (event) => void, dontConfirmInDev = true): void {

    if (ENV === "development" && dontConfirmInDev)
        return;

    // confirm page refresh / tab close / window close
    window.addEventListener("beforeunload", (event) => {
        event.preventDefault();

        if (callback)
            callback(event);
    });
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
 * Call given callback function inside try catch noteInput and return ```null``` if error is caught.
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
 * Call given callback function inside try catch noteInput and return nothing if error is caught.
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
 * @returns some attributes of the innerHtml of the core/columns noteInput
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
export function getTimeStamp(date = new Date()): string {

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
 * Note: user will need to consent for this function to work.
 * 
 * @returns raw unstyled text currently copied to clipboard
 */
export async function getClipboardText(): Promise<string> {

    return navigator.clipboard.readText();
}

/**
 * @param text to copy to clipboard
 */
export async function setClipboardText(text: string): Promise<void> {

    navigator.clipboard.writeText(text);
}


/**
 * @param eventKey to check
 * @param includeEnter whether to return ```true``` if event key equals "Enter". Default is ```true```
 * @returns ```true``` if given eventKey would take up space when inserted into a text input
 */
export function isEventKeyTakingUpSpace(eventKey: string, includeEnter = true): boolean {

    if (isEmpty(eventKey))
        return false;

    return eventKey.length === 1 || (includeEnter && eventKey === "Enter");
}


export function isEventKeyRemovingKey(eventKey: string): boolean {

    return eventKey === "Backspace" ||
           eventKey === "Delete";
}


/**
 * @param text string to clean up. Wont be altered
 * @returns same text string but with some special chars replaced
*/
export function cleanUpSpecialChars(text: string): string {

    let cleanHtml = text;
    cleanHtml = cleanHtml.replaceAll("&amp;", "&");
    cleanHtml = cleanHtml.replaceAll("&lt;", "<");
    cleanHtml = cleanHtml.replaceAll("&gt;", ">");
    cleanHtml = cleanHtml.replaceAll("&nbsp;", " ");

    return cleanHtml;
}


/**
 * @param str to change first char to upper case of (wont be altered)
 * @returns a copy of given string with the first char to upper case or a blank string
 */
export function toUpperCaseFirstChar(str: string): string {

    // case: blank
    if (isBlank(str))
        return str;

    // case: only one char
    if (str.length === 1)
        return str.toUpperCase();

    return str.charAt(0).toUpperCase() + str.substring(1);
}


/**
 * @param array the array with jsx elements to look in
 * @param key the key of the element to search in given ```array```
 * @returns the index of the element with given ```key``` in given ```array``` or -1
 */
export function getJsxElementIndexByKey(array: JSX.Element[], key: string): number {

    if (isArrayFalsy(array) || !array.length || isBlank(key))
        return -1;

    for (let i = 0; i < array.length; i++) 
        if (array[i].key === key) 
            return i;

    return -1;
}


export function getCurrentUrlWithoutWWW(): string {

    return `${BASE_URL}${window.location.pathname}`;
}


/**
 * Removes sensitive data from use query cache.
 */
export function clearSensitiveCache(): void {

    if (!useQueryClientObj)
        return;
    
    // remove app user from cache if present
    if (useQueryClientObj.getQueryData<AppUserEntity>(APP_USER_QUERY_KEY))
        useQueryClientObj.removeQueries({queryKey: APP_USER_QUERY_KEY});
}


/**
 * Removes use query cache data related to app user (not ```isLoggedIn``` though). May be used on logout.
 */
export function clearUserCache(): void {

    if (!useQueryClientObj)
        return;
    
    if (useQueryClientObj.getQueryData<AppUserEntity>(APP_USER_QUERY_KEY))
        useQueryClientObj.removeQueries({queryKey: APP_USER_QUERY_KEY});

    if (useQueryClientObj.getQueryData<AppUserEntity>(NOTE_QUERY_KEY))
        useQueryClientObj.removeQueries({queryKey: NOTE_QUERY_KEY});
}