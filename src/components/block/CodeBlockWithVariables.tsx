import React, { HTMLAttributes, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/CodeBlockWithVariables.scss";
import 'highlight.js/styles/github.css';
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import ContentEditableDiv from "../helpers/ContentEditableDiv";
import hljs from "highlight.js";
import { equalsIgnoreCase, getClipboardText, insertString, isBlank, log, setClipboardText } from "../../helpers/utils";
import sanitize from "sanitize-html";
import { VARIABLE_INPUT_DEFAULT_PLACEHOLDER, VARIABLE_INPUT_SEQUENCE_REGEX, VARIABLE_INPUT_END_SEQUENCE, VARIABLE_INPUT_START_SEQUENCE, DEFAULT_HTML_SANTIZER_OPTIONS } from "../../helpers/constants";
import { AppContext } from "../App";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function CodeBlockWithVariables({...props}: Props) {
    
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "CodeBlockWithVariables");
    
    const { isKeyPressed } = useContext(AppContext);
    
    const inputDivRef = useRef(null);
    const copyIconRef = useRef(null);
    
    
    // TODO: 
        // switch between higlighting styles (settings)
        // disable highlighting option (settings (?))
        // language select
        // full size mode
            // resize default block
            // overlay
            // just under full window size
            // x close
                // also on escape and click outside
        // copy
        // highlight
            // pending animation if takes longer than 300ms (?)
            // disable while pending
        // consider max input size


    /**
     * @param text any text
     * @returns highlighted and then sanitized html string (using {@link DEFAULT_HTML_SANTIZER_OPTIONS})
     */
    function highlightAndSanitizeDefault(text: string): string {

        return sanitize(hljs.highlightAuto(text).value, DEFAULT_HTML_SANTIZER_OPTIONS);
    }


    /**
     * Highlight inner content of input. Also add ```<input>```s if necessary.
     */
    // TODO: 
        // recursive
        // cover inner childs one by one
    function highlightInputDivContent(): void {
        
        const inputDiv = $(inputDivRef.current!);
        const inputChildren = inputDiv.children();

        // TODO: make this a helper
        const firstLine = getFirstInputDivContentLine();

        let highlightedHtmlString = "";

        // case: first line with inputs
        if (includesVariableInputSequence(firstLine))
            highlightedHtmlString += "<div>" + highlightAndSanitizeWithVariableInputs(firstLine);

        // case: first line with text only
        else if (!isBlank(firstLine))
            highlightedHtmlString += "<div>" + highlightAndSanitizeDefault(getFirstInputDivContentLine());

        if (!isBlank(firstLine))
            highlightedHtmlString += "</div>";

        // iterate lines after first line
        Array.from(inputChildren).forEach(child => {
            let innerText = child.innerText;
            const innerHtml = child.innerHTML;

            // clean up special chars
            innerText = cleanUpSpecialChars(innerText);
            
            highlightedHtmlString += "<div>";

            // case: line with inputs
            if (includesVariableInputSequence(innerText)) 
                highlightedHtmlString += highlightAndSanitizeWithVariableInputs(innerText);
                
            // case: empty line
            else if (innerHtml === "<br>") 
                highlightedHtmlString += "<br>";

            // case: line with text only
            else if (!isBlank(innerText))
                highlightedHtmlString += highlightAndSanitizeDefault(innerText);

            highlightedHtmlString += "</div>";
        });

        inputDiv.html(highlightedHtmlString);
    }


    function unHighlightInputDivContent(): void {

        const inputDiv = $(inputDivRef.current!);
        const inputHtml = inputDiv.html();

        // remove highlights
        let sanitizedInputHtml = sanitizeForInputDiv(inputHtml);

        // convert inputs
        sanitizedInputHtml = parseVariableInputToVariableInputSequence(sanitizedInputHtml);

        inputDiv.html(sanitizedInputHtml);
    }


    /**
     * @returns plain text of the very first line of the content editable which is not wrapped inside a ```<div>```
     */
    function getFirstInputDivContentLine(): string {

        const inputDiv = $(inputDivRef.current!);
        let inputHtml = inputDiv.html();

        // case: no html tags inside inputDiv
        if (!inputHtml.includes("<"))
            inputHtml = inputDiv.text();
        
        else {
            // get text until first tag
            inputHtml = inputHtml.substring(0, inputHtml.indexOf("<"));
            inputHtml = cleanUpSpecialChars(inputHtml);
        }

        return inputHtml;
    }


    /**
     * @param text string to clean up. Wont be altered
     * @returns same text string but with some special chars replaced
     */
    function cleanUpSpecialChars(text: string): string {

        let cleanHtml = text;
        cleanHtml = cleanHtml.replaceAll("&amp;", "&");
        cleanHtml = cleanHtml.replaceAll("&lt;", "<");
        cleanHtml = cleanHtml.replaceAll("&gt;", ">");
        cleanHtml = cleanHtml.replaceAll("&nbsp;", " ");

        return cleanHtml;
    }


    /**
     * Indicates whether given ```str``` includes variable input sequence that is to be replaced with a variable ```<input>```.
     * 
     * @param str to check
     * @returns ```true``` if given ```str``` includes a ```$[[``` followed by a ```]]```. See {@link VARIABLE_INPUT_SEQUENCE_REGEX}
     */
    function includesVariableInputSequence(str: string): boolean {

        return !isBlank(str) && str.match(VARIABLE_INPUT_SEQUENCE_REGEX) !== null;
    }


    /**
     * Calls {@link highlightAndSanitizeWithVariableInput()} until all ```$[[]]``` sequences are replaced.
     * 
     * @param text plain text string to adjust. Wont be altered
     * @returns the highlighted and sanitized html string possibly with ```<input>```s
     */
    function highlightAndSanitizeWithVariableInputs(text: string): string {

        // dont alter param
        let alteredText = text;

        // result string
        let highlightedtext = "";

        while(alteredText.includes(VARIABLE_INPUT_START_SEQUENCE) && alteredText.includes(VARIABLE_INPUT_END_SEQUENCE)) {
            highlightedtext += highlightAndSanitizeWithVariableInput(alteredText);

            alteredText = alteredText.substring(alteredText.indexOf(VARIABLE_INPUT_END_SEQUENCE) + 2);
        }

        // consider text after last "]]"
        return highlightedtext + alteredText;
    }


    /**
     * Highlight and sanitize given string until the first occurence of a ```$[[``` string (not considering if it's closed).
     * Any html after the ```]]``` will be ignored. 
     * 
     * If there's no ```]]``` an ```<input>``` with an empty placeholder attribute will be appended* ignoring any text after the ```$[[```.
     * 
     * @param innerHtml html string to adjust. Wont be altered
     * @returns highlighted html and possibly an ```<input>``` replacement
     */
    function highlightAndSanitizeWithVariableInput(innerHtml: string): string {

        const openingSequenceStartIndex = innerHtml.indexOf(VARIABLE_INPUT_START_SEQUENCE);
        const textBeforeSequence = innerHtml.substring(0, openingSequenceStartIndex);

        return highlightAndSanitizeDefault(textBeforeSequence) + parseVariableInputSequenceToVariableInput(innerHtml)
    }


    /**
     * Get the ```<input>``` tag that will replace the ```$[[]]``` sequence.
     * 
     * @param innerHtml containing the ```$[[]]``` sequence
     * @returns an ```<input>``` passing the value of the ```$[[]]``` sequence as placeholder (or "" if ```$[[]]``` not found)
     */
    function parseVariableInputSequenceToVariableInput(innerHtml: string): string {

        const openingSequenceStartIndex = innerHtml.indexOf(VARIABLE_INPUT_START_SEQUENCE);
        const openingSequenceEndIndex = innerHtml.indexOf(VARIABLE_INPUT_END_SEQUENCE);

        let placeholder = innerHtml.substring(openingSequenceStartIndex + 3, openingSequenceEndIndex);
    
        // case: invalid variable sequence
        if (openingSequenceStartIndex === -1 || openingSequenceEndIndex === -1)
            placeholder = "";

        return getDefaultVariableInput(placeholder);
    }


    /**
     * @param placeholder to use for the ```<input>```. Default is {@link VARIABLE_INPUT_DEFAULT_PLACEHOLDER}.
     * 
     * @returns ```<input>``` tag as string with a few attributes
     */
    function getDefaultVariableInput(placeholder = VARIABLE_INPUT_DEFAULT_PLACEHOLDER): string {

        return `<input type="text" class="variableInput" placeholder="${placeholder}" />`;
    }
    
    
    /**
     * Appends a default ```<input>``` to the end of the inputDiv.
     */
    function appendVariableInput(): void {

        const inputDiv = $(inputDivRef.current!);
        const inputDivs = inputDiv.find("div")
        const lastDiv = inputDivs.length ? inputDivs.last() : inputDiv;

        lastDiv.html(lastDiv.html() + getDefaultVariableInput());
    }


    /**
     * Replace all ```<input>``` with "$[[]]" sequence and placeholder attribute key with "". Assuming that all other attributes have been 
     * removed already.
     * 
     * @param html html string to adjust. Wont be altered
     * @returns given ```html``` with replacments
     */
    function parseVariableInputToVariableInputSequence(html: string): string {

        let alteredHtml = html;

        alteredHtml = alteredHtml.replaceAll("<input ", VARIABLE_INPUT_START_SEQUENCE);
        alteredHtml = alteredHtml.replaceAll("placeholder=\"", "");
        alteredHtml = alteredHtml.replaceAll("\" />", VARIABLE_INPUT_END_SEQUENCE);
        
        return alteredHtml;
    }


    /**
     * @param dirtyHtml html string to sanitize
     * @returns html string with only ```div```, ```br``` and ```input``` tags and only ```placeholder``` attributes
     */
    function sanitizeForInputDiv(dirtyHtml: string): string {

        return sanitize(dirtyHtml, {
            allowedTags: ["div", "br", "input"],
            allowedAttributes: {"input": ["placeholder"]}
        }); 
    }
    

    /**
     * Sanitize and update clipboard text (if allowed) in order to paste plain text in inputs instead of styled html.
     */
    async function sanitizeAndUpdateClipboardText(): Promise<void> {

        // get clipboard text
        let clipboardText = await getClipboardText();

        // case: nothing copied or permission denied by browser
        if (isBlank(clipboardText))
            return;

        // remove styles
        clipboardText = sanitizeForInputDiv(clipboardText);
        // remove special chars
        clipboardText = cleanUpSpecialChars(clipboardText);

        await setClipboardText(clipboardText);
    }


    async function copyCodeToClipboard(): Promise<void> {

        const inputDiv = $(inputDivRef.current!);
        let inputHtml = inputDiv.html();

        // TODO: consider inputs
            // either use plain text or consider breaks somehow
                // insert \n?
                // consider spaces?

        // sanitize
        inputHtml = sanitizeForInputDiv(inputHtml);

        setClipboardText(inputHtml);
    }


    function animateCopyIcon(): void {

        const copyIcon = $(copyIconRef.current!);

        copyIcon.animate(
            {
                opacity: 0,
                fontSize: "3em"
            },
            400,
            "easeOutSine",
            () => {
                copyIcon.css("opacity", 1);
                copyIcon.css("fontSize", "1em");
            }
        );
    } 


    function handleFocus(event): void {
        
        if (event.target.className !== "variableInput")
            unHighlightInputDivContent();
    }
    
    
    function handleBlur(event): void {
        
        const variableInputs = $(".variableInput");

        // case: focus was not on a variable input
        if (!variableInputs.length || !variableInputs.has(":focus"))
            highlightInputDivContent();
    }


    function handleKeyDown(event): void {

        const inputDiv = $(inputDivRef.current!);
        const keyName = (event.key as string);

        // case: Ctrl + Shift + v
        if (isKeyPressed("Control") && isKeyPressed("Shift") && keyName === "V") {
            event.preventDefault();
            inputDiv.trigger("blur");
            appendVariableInput();
        }
    }


    function handleKeyDownCapture(event): void {

        const keyName = event.key;

        if (keyName === "Control")
            sanitizeAndUpdateClipboardText();
    }

        
    function handleKeyUp(event): void {

        const keyName = event.key;

        if (keyName === "Backspace")
            handleBackspace(event);
    }


    function handleBackspace(event): void {

        const inputDiv = $(inputDivRef.current!);
        const inputBreaks = inputDiv.find("br");
        
        // case: no content left
        if (isBlank(inputDiv.text()) && inputBreaks.length <= 1)
            // clean up empty tags
            inputDiv.html("");
    }


    async function handleCopyClick(event): Promise<void> {

        animateCopyIcon();

        await copyCodeToClipboard();
    }


    return (
        <Flex 
            id={id} 
            className={className + " fullWidth"}
            style={style}
            flexWrap="nowrap"
            {...otherProps}
        >
            <ContentEditableDiv 
                className="fullWidth codeInput" 
                ref={inputDivRef} 
                spellCheck={false} 
                onKeyDown={handleKeyDown} 
                onKeyUp={handleKeyUp}
                onKeyDownCapture={handleKeyDownCapture}
                onFocus={handleFocus}
                onBlur={handleBlur}
            /> 

            <Flex horizontalAlign="right" flexWrap="nowrap">
                {/* Add variable */}
                <Button 
                    className="addVariableButton defaultBlockButton hover flexCenter" 
                    title="Append variable (Ctrl + Shift + V)"
                    onClick={appendVariableInput}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-dollar-sign"></i>
                </Button>

                <Button
                    className="defaultBlockButton hover copyButton"
                    title="Copy"
                    onClick={handleCopyClick}
                >
                    <i className="fa-solid fa-copy" ref={copyIconRef}></i>
                    <i className="fa-solid fa-copy"></i>
                </Button>
            </Flex>
                
            {children}
        </Flex>
    )
}