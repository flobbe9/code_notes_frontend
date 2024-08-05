import React, { useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/CodeBlockWithVariables.scss";
import 'highlight.js/styles/github.css';
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import ContentEditableDiv from "../helpers/ContentEditableDiv";
import hljs from "highlight.js";
import { cleanUpSpecialChars, getClipboardText, getCssConstant, getCSSValueAsNumber, getTextWidth, includesIgnoreCase, isBlank, log, setClipboardText } from "../../helpers/utils";
import sanitize from "sanitize-html";
import { VARIABLE_INPUT_DEFAULT_PLACEHOLDER, VARIABLE_INPUT_SEQUENCE_REGEX, VARIABLE_INPUT_END_SEQUENCE, VARIABLE_INPUT_START_SEQUENCE, DEFAULT_HTML_SANTIZER_OPTIONS, CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE } from "../../helpers/constants";
import { AppContext } from "../App";
import { useInitialStyles } from "../../hooks/useInitialStyles";
import { DefaultCodeBlockContext } from "./DefaultCodeBlock";
import HelperProps from "../../abstract/HelperProps";
import { NoteInput } from "../../abstract/entites/NoteInput";
import { BlockContainerContext } from "./BlockContainer";
import parse from 'html-react-parser';
import { DefaultBlockContext } from "./DefaultBlock";


interface Props extends HelperProps {

    noteInput: NoteInput
}


/**
 * Component containing block with the less complex code editor but including variable inputs that are considered by the copy button.
 * 
 * @since 0.0.1
 * 
 */
// IDEA:
    // switch between higlighting styles (settings)
    // disable highlighting option (settings (?))
export default function CodeBlockWithVariables({
    noteInput,
    disabled,
    onBlur, 
    ...props
}: Props) {

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [inputDivValue, setInputDivValue] = useState<any>()
    
    const [inputDivJQuery, setInputDivJQuery] = useState<JQuery>($());

    const [isParsing, setIsParsing] = useState(false);

    const [hasComponentRendered, sethasComponentRendered] = useState(false);
    
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "CodeBlockWithVariables");
    
    const inputDivRef = useRef(null);

    const { 
        isKeyPressed, 
        toggleAppOverlay, 
        isAppOverlayVisible, 
        getAppOverlayZIndex
    } = useContext(AppContext);

    const { numBlocksParsing, setNumBlocksParsing } = useContext(BlockContainerContext);

    const { codeBlockWithVariablesLanguage, setBlockOverlayVisible } = useContext(DefaultBlockContext);

    const { animateCopyIcon } = useContext(DefaultCodeBlockContext);


    useInitialStyles(inputDivJQuery, [["max-width", "width"]], 100);

    
    useEffect(() => {
        setInputDivJQuery($(inputDivRef.current!));

        setInputDivValue(parse(sanitize(noteInput.value, DEFAULT_HTML_SANTIZER_OPTIONS)));

        sethasComponentRendered(true);
        
    }, []);


    useEffect(() => {
        $(window).on("keydown", handleGlobalKeyDown);

        return () => {
            $(window).off("keydown", handleGlobalKeyDown);
        }

    }, [isFullScreen, isAppOverlayVisible]);


    useEffect(() => {
        if (!isAppOverlayVisible && isFullScreen)
            // deactivate full screen on overlay click
            deactivateFullScreen();

    }, [isAppOverlayVisible]);


    useEffect(() => {
        updateNumBlocksParsing();

    }, [isParsing]);


    useEffect(() => {
        handleLanguageChange();

    }, [codeBlockWithVariablesLanguage])
    
    
    // TODO: 
        // consider max input size
            // use db max size

    /**
     * @param text any text
     * @returns highlighted and then sanitized html string (using {@link DEFAULT_HTML_SANTIZER_OPTIONS})
     */
    function highlightAndSanitizeDefault(text: string): string {

        let highlightedText;
        if (isAutoDetectLanguage())
            highlightedText= hljs.highlightAuto(text).value;

        else
            highlightedText= hljs.highlight(text, { language: codeBlockWithVariablesLanguage }).value;

        return sanitize(highlightedText, DEFAULT_HTML_SANTIZER_OPTIONS);
    }


    /**
     * Highlight inner content of input. Also add ```<input>```s if necessary. 
     * 
     * Will update input divs html.
     * 
     * @return the highlighted inner html
     */
    async function highlightInputDivContent(): Promise<string> {

        setIsParsing(true);
        setBlockOverlayVisible(true);

        const highlightPromise = await new Promise<string>((res, rej) => {
            setTimeout(() => {
                const inputDiv = $(inputDivRef.current!);
                const inputChildren = inputDiv.children();

                // case: first line is not a node
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

                res("highlightedHtmlString"); 
            }, 100); // wait for state to update
        });

        setIsParsing(false);
        setBlockOverlayVisible(false);

        updateAppUser();

        return highlightPromise;
    }


    /**
     * Remove highlighting of inputDiv content and parse ```<input>```s to inputVariableSequences.
     */
    async function unHighlightInputDivContent(): Promise<string> {

        const unHighlightedContent = await new Promise<string>((res, rej) => {
            setTimeout(() => {
                const inputDiv = $(inputDivRef.current!);
                const inputHtml = inputDiv.html();

                // remove highlights
                let sanitizedInputHtml = sanitizeForInputDiv(inputHtml);

                // convert inputs
                sanitizedInputHtml = parseVariableInputToVariableInputSequence(sanitizedInputHtml);

                inputDiv.html(sanitizedInputHtml);
                
                res(sanitizedInputHtml);
            }, 10); // wait for states to update
        });

        return unHighlightedContent;
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
     * Input will always be as wide as given ```placeholder``` text. Uses the default placeholder if given ```placeholder``` is blank.
     * 
     * @param placeholder to use for the ```<input>```. Default is {@link VARIABLE_INPUT_DEFAULT_PLACEHOLDER}.
     * @returns ```<input>``` tag as string with a few attributes
     */
    function getDefaultVariableInput(placeholder = VARIABLE_INPUT_DEFAULT_PLACEHOLDER): string {

        // case: invalid placeholder
        if (isBlank(placeholder))
            placeholder = VARIABLE_INPUT_DEFAULT_PLACEHOLDER;

        const inputWidth = getDefaultVariableInputWidth(placeholder);

        return `<input type="text" style="width: ${inputWidth}px" class="variableInput" placeholder="${placeholder}" />`;
    }


    /**
     * @param placeholder of input
     * @returns the width of a variableInput as if the ```placeholder``` was it's value and the width was 'fit-content'
     */
    function getDefaultVariableInputWidth(placeholder: string): number {
        
        const placeholderWidth = getTextWidth(placeholder, getCssConstant("variableInputFontSize"), getCssConstant("variableInputFontFamily"));
        const variableInputPadding = getCSSValueAsNumber(getCssConstant("variableInputPaddingLeftRight"), 2) * 2;
        const variableInputBorderWidth = getCSSValueAsNumber(getCssConstant("variableInputBorderWidth"), 2) * 2;

        return placeholderWidth + variableInputPadding + variableInputBorderWidth;
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

        setClipboardText(clipboardText);
    }


    /**
     * Copy content of inputDiv to clipboard considering the variableInput values, line breaks as well as spaces.
     * 
     * Appending a hidden div is necessary to keep line breaks when pasting. For some reason using ```innerText``` on an element
     * inside a ```<pre>``` tag will keep the line breaks and spaces.
     */
    async function copyInputDivContentToClipboard(): Promise<void> {

        const inputDiv = $(inputDivRef.current!);
        let inputDivHtml = inputDiv.html();

        // get varialbeInput values
        const variableInputValues = getVariableInputValues();

        // remove highlights and clean up <input>s
        inputDivHtml = sanitize(inputDivHtml, {
            allowedTags: ["div", "br", "input"],
            allowedAttributes: {}
        });

        // replace <input>s with their values
        const inputDivHtmlArray = inputDivHtml.split("<input />");
        inputDivHtml = inputDivHtmlArray.reduce((prev, curr, i) => prev + variableInputValues[i - 1] + curr);

        // create hidden div inside inputDiv
        const hiddenDiv = document.createElement("div");
        hiddenDiv.style.display = "none";
        // add sanitized content
        hiddenDiv.innerHTML = inputDivHtml;

        // use inner text for keeping line breaks and spaces
        await setClipboardText(hiddenDiv.innerText);

        // remove hidden div
        hiddenDiv.remove();
    }


    /**
     * @returns list of values of variableInputs inside inputDiv
     */
    function getVariableInputValues(): string[] {

        let values: string[] = [];

        $(inputDivRef.current!).find("input")
                               .each((i, input) => {
                                    if (input.type === "text")
                                        values.push(input.value)
                                });

        return values;
    }
    

    /**
     * Increase the ```numBlocksParsing``` by 1 if block is currently parsing, or else decrease it by 1 
     * (but never go below 0).
     */
    function updateNumBlocksParsing(): void {

        if (isParsing)
            setNumBlocksParsing(numBlocksParsing + 1);
        
        else if (numBlocksParsing > 0)
            setNumBlocksParsing(numBlocksParsing - 1);
    }


    /**
     * @returns ```true``` if input div contains the placeholder, else ```false```
     */
    function hasPlaceholder(): boolean {

        return $(inputDivRef.current!).children().first().is(".placeholderInput");
    }


    /**
     * Set all noteInput fields for this block.
     */
    function updateAppUser(): void {

        // value
        noteInput.value = $(inputDivRef.current!).html();

        // programmingLanguage
        noteInput.programmingLanguage = codeBlockWithVariablesLanguage;
    }


    function handleFocus(event): void {

        if (event.target.className !== "variableInput" && !hasPlaceholder())
            unHighlightInputDivContent();
    }


    async function handleBlur(event): Promise<void> {

        if (disabled)
            return;

        if (onBlur)
            onBlur(event);

        const variableInputs = $(inputDivRef.current!).find(".variableInput");
        
        // case: focus was not on a variable input or the placeholder textarea
        // TODO: focus condition does not work
        if ((!variableInputs.length || !variableInputs.has(":focus").length) && !hasPlaceholder())
            await highlightInputDivContent();
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


    function handleGlobalKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "Escape") 
            handleEscape(event);
    }


    function handleEscape(event): void {

        if (isFullScreen)
            deactivateFullScreen();
    }

        
    function handleKeyUp(event): void {

        const keyName = event.key;

        if (keyName === "Backspace" || keyName === "Delete")
            cleanUpEmptyInputDiv(event);
    }


    function cleanUpEmptyInputDiv(event): void {

        const inputDiv = $(inputDivRef.current!);
        const inputBreaks = inputDiv.find("br");
        
        // case: no content left
        if (isBlank(inputDiv.text()) && inputBreaks.length <= 1)
            // clean up empty tags
            inputDiv.html("");
    }


    function handleInputDivContainerClick(event): void {

        const inputDiv = $(inputDivRef.current!);

        // case: not focuesd yet and not clicking a variableInput
        if (!inputDiv.is(":focus") && event.target.className !== "variableInput")
            // focus input div
            inputDiv.trigger("focus");
    }


    async function handleCopyClick(event): Promise<void> {

        animateCopyIcon();

        await copyInputDivContentToClipboard();
    }


    function toggleFullScreen(event): void {

        if (isFullScreen)
            deactivateFullScreen();
        else
            activateFullscreen();
    }


    function activateFullscreen(): void {

        activateFullScreenStyles();

        setIsFullScreen(true);

        toggleAppOverlay();

        $(inputDivRef.current!).trigger("focus");
    }


    function deactivateFullScreen() {

        deactivateFullScreenStyles();

        setIsFullScreen(false);

        if (isAppOverlayVisible)
            toggleAppOverlay();
    }
    

    function activateFullScreenStyles(): void {

        const inputDiv = $(inputDivRef.current!);
        const blockContent = inputDiv.parents(".blockContent");
        const inputDivContainer = inputDiv.parents(".inputDivContainer");

        const appOverlayZIndex = getAppOverlayZIndex();

        blockContent.css({
            position: "fixed",
            zIndex: appOverlayZIndex + 1
        });

        blockContent.animate({
            top: "90px",
            width: "90vw"
        });

        inputDivContainer.animate({
            height: "80vh"
        })

        inputDiv.animate({
            maxHeight: "80vh"
        })
    }


    function deactivateFullScreenStyles(): void {

        const inputDiv = $(inputDivRef.current!);
        const blockContent = inputDiv.parents(".blockContent");
        const inputDivContainer = inputDiv.parents(".inputDivContainer");
        
        // move up just a little bit
        blockContent.css({
            position: "relative",
            top: "30px",
        });
        
        // resize quickly
        blockContent.css({
            width: "100%"
        });
        inputDivContainer.css({
            height: "100%"
        });
        inputDiv.css({
            maxHeight: "var(--codeBlockWithVariablesMinHeight)"
        })

        // animate to start pos
        blockContent.animate(
            {
                top: 0,
            },
            300,
            "swing", 
            () => {
                // reset to initial styles
                blockContent.css({
                    position: "static",
                    top: "auto",
                    zIndex: 0
                });
            }
        )
    }


    async function handleLanguageChange(): Promise<void> {

        // case: called on load
        if (!hasComponentRendered)
            return;

        await unHighlightInputDivContent();

        highlightInputDivContent();

        updateAppUser();
    }


    function isAutoDetectLanguage(): boolean {

        return codeBlockWithVariablesLanguage === CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE;
    }


    return (
        <Flex 
            id={id} 
            className={className + " fullWidth"}
            style={style}
            flexWrap="nowrap"
            {...otherProps}
        >
            <pre 
                className="inputDivContainer fullWidth"
                onClick={handleInputDivContainerClick}
            >
                <code>
                    {/* dont use a placeholder because of conflicts with vairableInputs */}
                    <ContentEditableDiv 
                        className="inputDiv fullWidth" 
                        ref={inputDivRef} 
                        spellCheck={false}
                        onKeyDownCapture={handleKeyDownCapture}
                        onKeyDown={handleKeyDown} 
                        onKeyUp={handleKeyUp}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    >
                        { inputDivValue }
                    </ContentEditableDiv> 
                </code>
            </pre>

            <Flex horizontalAlign="right" flexWrap="nowrap" verticalAlign="start">
                {/* Fullscreen */}
                <Button 
                    className="fullScreenButton"
                    title={isFullScreen ? "Normal screen" : "Fullscreen"}
                    onClick={toggleFullScreen}
                >
                    {isFullScreen ?
                        <i className="fa-solid fa-down-left-and-up-right-to-center"></i> :
                        <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
                    }
                </Button>

                {/* Add variable */}
                <Button 
                    className="addVariableButton defaultBlockButton hover flexCenter fullHeight" 
                    title="Append variable (Ctrl + Shift + V)"
                    onClick={appendVariableInput}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-dollar-sign"></i>
                </Button>

                {/* Copy */}
                <Button
                    className="defaultBlockButton hover copyButton fullHeight"
                    title="Copy with variables"
                    onClick={handleCopyClick}
                >
                    <i className="fa-solid fa-copy"></i>
                    <i className="fa-solid fa-copy"></i>
                </Button>
            </Flex>
            
            {children}
        </Flex>
    )
}