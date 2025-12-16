import { useQueryClientObj } from "@/main";
import parse, { Element } from "html-react-parser";
import sanitize from "sanitize-html";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { RememberMyChoiceKey, isRememberMyChoiceValue } from "../abstract/RememberMyChoice";
import { APP_USER_QUERY_KEY } from "../hooks/useAppUser";
import { CSRF_TOKEN_QUERY_KEY } from "../hooks/useCsrfToken";
import { NOTES_QUERY_KEY } from "../hooks/useNotes";
import { APP_NAME_PRETTY, DEFAULT_HTML_SANTIZER_OPTIONS, REMEMBER_MY_CHOICE_KEY_PREFIX } from "./constants";
import { logDebug, logWarn } from "./logUtils";
import { assertFalsyAndLog, getRandomString, isBlank, isEmpty, stringToHtmlElement } from "./utils";

/**
 * Meant to provide specific util methods that are not needed in any project.
 * 
 * @since 1.0.0
 */


/**
 * Get line elements (inner divs) of given ```contentEditableDiv```. Notice that this does NOT include the very first line as that is never
 * a div element.
 * 
 * @param contentEditableDiv 
 * @returns all first level inner divs of ```contentEditableDiv``` that represent a line (this excludes divs without inner html or inner text). 
 *          Empty array if invalid param
 */
export function getContentEditableDivLineElements(contentEditableDiv: HTMLDivElement): HTMLDivElement[] {

    if (!contentEditableDiv || !contentEditableDiv.isContentEditable)
        return [];

    return Array.from(contentEditableDiv.querySelectorAll("div:not(:empty)"));
}


export function isContentEditableDiv(element: HTMLElement): boolean {

    return element && element instanceof HTMLDivElement && (element as HTMLDivElement).isContentEditable
}


/**
 * Move the cursor once sothat the current selection (if any) is removed.
 * 
 * @param inputElement to unselect text for
 * @param direction to move the cursor to when unselecting. Default is 'left'
 */
export function unselectContentEditableDivText(inputElement: HTMLDivElement, direction: "left" | "right" = "left"): void {
    if (!isContentEditableDiv(inputElement))
        return;

    if (!isTextSelected())
        return;
    
    document.getSelection()!.modify("move", direction, "character");
}

/**
 * Move cursor of a text input element or a content editable div. If ```start === end``` the cursor will be shifted normally to given position.
 * If ```start !== end``` the text between the indices will be marked.
 * 
 * @param inputElement  to move the cursor in
 * @param start index of selection start, default is 0
 * @param end index of selection end, default is ```start``` param
 */
export function moveCursor(inputElement: HTMLInputElement | HTMLDivElement, start = 0, end = start): void {
    if (!inputElement)
        return;

    if (inputElement instanceof HTMLInputElement) {
        inputElement.selectionStart = start;
        inputElement.selectionEnd = end;

    } else if (isContentEditableDiv(inputElement)) {
        unselectContentEditableDivText(inputElement);
        
        const currentCursorIndex = getCursorIndex(inputElement);
        if (currentCursorIndex === -1)
            return;

        // move cursor to 'start'
        for (let i = 0; i < Math.abs(currentCursorIndex - start); i++) {
            const direction = currentCursorIndex - start < 0 ? "forward" : "backward";
            document.getSelection()?.modify("move", direction, "character");
        }

        // extend cursor to 'end'
        if (start !== end) {
            for (let i = 0; i < Math.abs(end - start); i++) {
                const direction = start - end < 0 ? "forward" : "backward";
                document.getSelection()?.modify("extend", direction, "character");            
            }
        }

    } else 
        logWarn("Invalid 'inputElement' type");
}


/**
 * Works for both text input and contenteditable div
 * @param inputElement to get the cursor for
 * @returns the current index of the cursor of given text input element or -1. If text is marked, the index of selection start is returned
 */
export function getCursorIndex(inputElement: HTMLInputElement | HTMLDivElement): number {
    if (!inputElement)
        return -1;

    if (inputElement instanceof HTMLInputElement)
        return inputElement.selectionStart ?? -1;

    if (isContentEditableDiv(inputElement))
        return document.getSelection()?.anchorOffset ?? -1;

    logWarn("Invalid 'inputElement' type");
    return -1;
}


/**
 * @param inputElement to get the line number for
 * @returns the 1-based line number of the current selection start in given ```inputElement``` or -1 if falsy params
 */
export function getCursorLineNum(inputElement: HTMLTextAreaElement | HTMLDivElement): number {
    if (!inputElement)
        return -1;

    if (inputElement instanceof HTMLTextAreaElement) {
        const cursorIndex = inputElement.selectionStart;
        const value = inputElement.value;

        return value.substring(0, cursorIndex).split("\n").length;
    }

    if (inputElement instanceof HTMLDivElement) {
        const documentSelection = document.getSelection();
        // the selection start index
        const initialAnchorOffset = documentSelection?.anchorOffset!;
        // the selection end index, negative if selected backwards
        const initialFocusOffset = documentSelection?.focusOffset!;
        const initiallySelectedText = isTextSelected();

        if (assertFalsyAndLog(documentSelection, initialAnchorOffset, initialFocusOffset))
            return -1;
        
        let lineCount = 1; // 1-based
        
        // move to start of line (pos (0, y))
        documentSelection?.modify("move", "left", "lineboundary")
        documentSelection?.modify("extend", "backward", "line")
        
        // move up to pos (0, 0)
        while (!documentSelection?.isCollapsed) {
            lineCount++;
            documentSelection?.modify("move", "left", "lineboundary")
            documentSelection?.modify("extend", "backward", "line")
        }

        logDebug("lineCount", lineCount)

        // move back to initial line num
        for (let i = 1; i < lineCount; i++)
            documentSelection?.modify("move", "forward", "line");

        // move back to initial cursor index
        moveCursor(inputElement, initialAnchorOffset);

        // select initially selected text
        if (initiallySelectedText) {
            for (let i = 0; i < Math.abs(initialAnchorOffset - initialFocusOffset); i++)
                documentSelection?.modify("extend", initialAnchorOffset < initialFocusOffset ? "forward" : 'backward', "character");
        }
        return lineCount;
    }

    logWarn("Invalid 'inputElement' type");
    return -1;
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

    const elementId = getRandomString();
    document.body.append(stringToHtmlElement(
        `<div
            id="${elementId}"
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
    ));
    const hiddenInputDiv2 = document.getElementById(elementId);
    
    const hiddenInputDivWidth2 = hiddenInputDiv2?.offsetWidth;

    hiddenInputDiv2?.remove();

    return hiddenInputDivWidth2 || 0;
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
 * Removes sensitive data from use query cache.
 */
export function clearSensitiveCache(): void {
    
    if (useQueryClientObj && useQueryClientObj.getQueryData<AppUserEntity>(APP_USER_QUERY_KEY))
        useQueryClientObj.removeQueries({queryKey: APP_USER_QUERY_KEY});

    localStorage.removeItem(CSRF_TOKEN_QUERY_KEY);
}


/**
 * Removes use query cache data related to app user (not ```isLoggedIn``` though). May be used on logout.
 */
export function clearUserCache(): void {

    if (!useQueryClientObj)
        return;
    
    clearSensitiveCache();

    if (useQueryClientObj.getQueryData<AppUserEntity>(NOTES_QUERY_KEY))
        useQueryClientObj.removeQueries({queryKey: NOTES_QUERY_KEY});
}


/**
 * Attempts to retrieve the csrf token from cache. 
 * 
 * @returns the csrf token or a blank string
 */
export function getCsrfToken(): string {

    const csrfToken = localStorage.getItem(CSRF_TOKEN_QUERY_KEY);

    if (isBlank(csrfToken))
        return "";

    return csrfToken!;
}


/**
 * Will store given ```csrfToken``` in localStorage (regardless of the token beeing blank or not).
 * 
 * @param csrfToken to encrypt and cache
 */
export function setCsrfToken(csrfToken: string): void {
    
    localStorage.setItem(CSRF_TOKEN_QUERY_KEY, csrfToken);
}


/**
 * Find choice in localStorage and possibly call callback.
 * 
 * Will remove localStorage entry if value is invalid.
 * 
 * @param key to determine the right popup. Will prepend {@link REMEMBER_MY_CHOICE_KEY_PREFIX}
 * @param confirmCallback executed if rememberd choice is "confirm"
 * @returns ```true``` if a valid choice was cached (no matter if "confirm" or "cancel")
 */
export function handleRememberMyChoice(key: RememberMyChoiceKey, confirmCallback?: () => void): boolean {

    const choice = localStorage.getItem(REMEMBER_MY_CHOICE_KEY_PREFIX + key);

    if (!choice) 
        return false;
    
    // case: invalid value in stored in localStorage
    if (!isRememberMyChoiceValue(choice)) {
        logWarn(`Choice '${choice}' is not a valid 'RememberMyChoiceValue'. Removing entry`);
        localStorage.removeItem(REMEMBER_MY_CHOICE_KEY_PREFIX + key);
        return false;
    }

    if (choice === "confirm" && confirmCallback)
        confirmCallback();

    return true;
}


/**
 * Get the text for the ```<title>```.
 * 
 * @param pageTitle title of page, not including the company name
 * @returns ```pageTitle | ${companyName}``` or just ```companyName``` if no ```pageTitle```
 */
export function getHeadTitleText(pageTitle?: string): string {

    return isBlank(pageTitle) ? `${APP_NAME_PRETTY}` : `${pageTitle} | ${APP_NAME_PRETTY}`; 
}

/**
 * @returns `true` if some text somewhere in the document is user selected
 */
export function isTextSelected(): boolean {
    const currentSelection = document.getSelection();

    if (!currentSelection)
        return false;

    return currentSelection.anchorOffset !== currentSelection.focusOffset;
}
