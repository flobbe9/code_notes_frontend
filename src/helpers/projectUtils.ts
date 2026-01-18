import { CursorPosition } from "@/abstract/CursorPosition";
import { MovableCursorElement } from "@/abstract/MovableCursorElement";
import { useQueryClientObj } from "@/main";
import parse, { Element } from "html-react-parser";
import sanitize from "sanitize-html";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { RememberMyChoiceKey, isRememberMyChoiceValue } from "../abstract/RememberMyChoice";
import { APP_USER_QUERY_KEY } from "../hooks/useAppUser";
import { CSRF_TOKEN_QUERY_KEY } from "../hooks/useCsrfToken";
import { NOTES_QUERY_KEY } from "../hooks/useNotes";
import { APP_NAME_PRETTY, DEFAULT_HTML_SANTIZER_OPTIONS, REMEMBER_MY_CHOICE_KEY_PREFIX } from "./constants";
import { logError, logWarn } from "./logUtils";
import { assertFalsyAndLog, getRandomString, isBlank, isEmpty, isNumberFalsy, stringToHtmlElement } from "./utils";

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
 * Move cursor to `to.x` and possibly to `to.y` (only for contenteditable divs), then extend the selection to `to.selectedChars`, either "backward" or "forward".
 * 
 * @param inputElement  to move the cursor in
 * @param to the directions
 */
export function moveCursor(inputElement: MovableCursorElement, to: CursorPosition | null): void { // start, linenum, num charse selected (may be negative), 
    if (!inputElement || !to || !isCursorPositionValid(to)) {
        logWarn("Failed to move cursor. Invalid args", inputElement, to);
        return;
    }

    if (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement) {
        // case: did not want to move at all
        if (to.x < 0)
            return;

        // move to x
        if (to.selectedChars >= 0)
            inputElement.selectionStart = to.x;

        // case: extend forward
        if (to.selectedChars > 0)
            inputElement.selectionEnd = to.x + to.selectedChars;

        // case: extend backward
        else if (to.selectedChars < 0) {
            inputElement.selectionStart = Math.max(to.x + to.selectedChars, 0);
            inputElement.selectionEnd = to.x;

        } else
            inputElement.selectionEnd = to.x;

    } else if (isContentEditableDiv(inputElement)) {
        const documentSelection = document.getSelection();
        if (!documentSelection)
            return;

        const currentPos = getCursorPos(inputElement);
        if (!currentPos)
            return;

        // move y
        if (to.y > 0 && currentPos.y !== to.y) {
            const numLinesToMove = to.y - currentPos.y;
            const direction = to.y - currentPos.y < 0 ? "backward" : "forward";

            for (let i = 0; i < Math.abs(numLinesToMove); i++)
                documentSelection.modify("move", direction, "line");

            // case: don't want to change x, move back to initial x
            if (to.x < 0)
                for (let i = 0; i < currentPos.x; i++)
                    documentSelection.modify("move", "forward", "character");
        }

        // move x
        if (to.x >= 0) {
            // move to x = 0
            documentSelection.modify("move", "backward", "lineboundary");

            // move to desired x
            for (let i = 0; i < to.x; i++)
                documentSelection.modify("move", "forward", "character");

            // extend
            const selectionDirection = to.selectedChars < 0 ? "backward" : "forward";
            for (let i = 0; i < Math.abs(to.selectedChars); i++)
                documentSelection.modify("extend", selectionDirection, "character"); // will start at last cursor x
        }

    } else 
        logWarn("Invalid 'inputElement' type");
}

/**
 * @param cursorPosition 
 * @returns `false` if any prop is not a number or is outside it's boundaries (see Cursorposition)
 */
function isCursorPositionValid(cursorPosition: CursorPosition | null): boolean {
    return !!cursorPosition && 
        !isNumberFalsy(cursorPosition.x) && cursorPosition.x >= -1 && 
        !isNumberFalsy(cursorPosition.y) && cursorPosition.y >= 0 && 
        !isNumberFalsy(cursorPosition.selectedChars)
}

/**
 * Value will be relative to line for contenteditable divs. For any other input the value will be relative to the whole input's value.
 * 
 * @param inputElement to get the cursor for
 * @returns 0-based the current index of the cursor of given text input element or -1. If text is marked, the index of selection start is returned
 */
export function getCursorIndex(inputElement: MovableCursorElement): number {
    if (!inputElement)
        return -1;

    if (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement)
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
export function getCursorLineNum(inputElement: MovableCursorElement): number {
    if (!inputElement)
        return -1;

    if (inputElement instanceof HTMLInputElement)
        return 1;

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
        const didInitiallySelectedText = getNumCharsSelected(inputElement) > 0;

        if (assertFalsyAndLog(documentSelection, initialAnchorOffset, initialFocusOffset))
            return -1;
        
        let lineCount = 1; // 1-based
        
        // move to start of line (pos (0, y))
        documentSelection?.modify("move", "left", "lineboundary");
        documentSelection?.modify("extend", "backward", "line");
        
        // move up to pos (0, 0)
        while (!documentSelection?.isCollapsed) {
            lineCount++;
            documentSelection?.modify("move", "left", "lineboundary");
            documentSelection?.modify("extend", "backward", "line");
        }

        // move back to initial line num
        for (let i = 1; i < lineCount; i++)
            documentSelection?.modify("move", "forward", "line");

        // move to x = 0
        documentSelection.modify("move", "backward", "lineboundary");
        // move back to initial x
        for (let i = 0; i < initialAnchorOffset; i++)
            documentSelection.modify("move", "forward", "character");

        // select initially selected text
        if (didInitiallySelectedText) {
            for (let i = 0; i < Math.abs(initialAnchorOffset - initialFocusOffset); i++)
                documentSelection?.modify("extend", initialAnchorOffset < initialFocusOffset ? "forward" : 'backward', "character");
        }
        return lineCount;
    }

    logWarn("Invalid 'inputElement' type");
    return -1;
}

/**
 * @param element 
 * @returns `{ x: -1, y: -1: selectedChars: 0 }` if no document selection yet
 */
export function getCursorPos(element: MovableCursorElement): CursorPosition {
    const documentSelection = document.getSelection();
    if (!documentSelection)
        return {
            x: -1,
            y: -1,
            selectedChars: 0
        };

    return {
        x: getCursorIndex(element),
        y: getCursorLineNum(element),
        selectedChars: getNumCharsSelected(element)
    }
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
                font-size: ${fontSize};
                font-family:  ${fontFamily};
                font-weight: ${fontWeight};
                opacity: 0;
                position: fixed;
                width: fit-content;
                z-index: -1;
            ' 
            contenteditable
        >
            ${text}
        </div>`
    ));
    const hiddenInputDiv2 = document.getElementById(elementId);
    
    const hiddenInputDivWidth2 = hiddenInputDiv2?.offsetWidth;

    // hiddenInputDiv2?.remove();

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
 * For contenteditable divs this is only returns the correct result for selections within the same line. 
 * 
 * Will include line breaks as "selected char".
 * 
 * @param element 
 * @returns absolute number of selected chars. -1 if unable to evaluate
 */
export function getNumCharsSelected(element: MovableCursorElement): number {
    if (!element)
        return -1;

    if (isContentEditableDiv(element)) {
        const documentSelection = document.getSelection();
        if (!documentSelection) {
            logError("Failed to get num chars. No document selection");
            return -1;
        }

        if (documentSelection.isCollapsed)
            return 0;

        return Math.abs(documentSelection.focusOffset - documentSelection.anchorOffset);
    }

    const inputElement = element as HTMLInputElement;

    // case: nothing selected
    if (inputElement.selectionEnd === null)
        return 0;

    // assume that selectionStart must be truthy if selectionEnd is
    return inputElement.selectionEnd - inputElement.selectionStart!;
}