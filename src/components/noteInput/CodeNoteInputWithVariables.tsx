import hljs from "highlight.js";
import parse from 'html-react-parser';
import $ from "jquery";
import React, { useContext, useEffect, useRef, useState } from "react";
import sanitize from "sanitize-html";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import { NoteInputEntity } from "../../abstract/entites/NoteInputEntity";
import "../../assets/styles/CodeNoteInputWithVariables.scss";
import "../../assets/styles/highlightJs/vs.css";
import { CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE, DEFAULT_HTML_SANTIZER_OPTIONS, getDefaultVariableInput, VARIABLE_INPUT_DEFAULT_PLACEHOLDER, VARIABLE_INPUT_END_SEQUENCE, VARIABLE_INPUT_SEQUENCE_REGEX, VARIABLE_INPUT_START_SEQUENCE } from "../../helpers/constants";
import { cleanUpSpecialChars, getClipboardText, getCssConstant, getCSSValueAsNumber, getTextWidth, isBlank, setClipboardText } from "../../helpers/utils";
import { useInitialStyles } from "../../hooks/useInitialStyles";
import { AppContext } from "../App";
import Button from "../helpers/Button";
import ContentEditableDiv from "../helpers/ContentEditableDiv";
import Flex from "../helpers/Flex";
import { DefaultNoteInputContext } from "./DefaultNoteInput";
import NoteInputSettings from "./NoteInputSettings";
import Overlay from "../helpers/Overlay";


interface Props extends HelperProps {

    noteInputEntity: NoteInputEntity
}


/**
 * Component containing noteInput with the less complex code editor but including variable inputs that are considered by the copy button.
 * 
 * @since 0.0.1
 * 
 */
export default function CodeNoteInputWithVariables({
    noteInputEntity,
    disabled,
    onBlur, 
    ...props
}: Props) {

    const [inputDivValue, setInputDivValue] = useState<any>()
    
    const [inputDivJQuery, setInputDivJQuery] = useState<JQuery>($());

    const [hasComponentRendered, sethasComponentRendered] = useState(false);

    const [inputHighlighted, setInputHighlighted] = useState(true);
    
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "CodeNoteInputWithVariables");
    
    const inputDivRef = useRef(null);

    const { isKeyPressed } = useContext(AppContext);

    const { 
        codeNoteInputWithVariablesLanguage, 
        isNoteInputOverlayVisible,
        setIsNoteInputOverlayVisible, 
        areNoteInputSettingsDisabled, 
        animateCopyIcon,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,
        isFullScreen
    } = useContext(DefaultNoteInputContext);


    useInitialStyles(inputDivJQuery, [["max-width", "width"]], 100);

    
    useEffect(() => {
        setInputDivJQuery($(inputDivRef.current!));

        setInputDivValue(parse(sanitize(noteInputEntity.value, DEFAULT_HTML_SANTIZER_OPTIONS)));

        sethasComponentRendered(true);

        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});
        
    }, []);


    useEffect(() => {
        handleLanguageChange();

    }, [codeNoteInputWithVariablesLanguage]);
    
    
    /**
     * @param text any text
     * @returns highlighted and then sanitized html string (using {@link DEFAULT_HTML_SANTIZER_OPTIONS})
     */
    function highlightAndSanitizeDefault(text: string): string {

        let highlightedText;
        if (isAutoDetectLanguage())
            highlightedText= hljs.highlightAuto(text).value;

        else
            highlightedText= hljs.highlight(text, { language: codeNoteInputWithVariablesLanguage }).value;

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

        setIsNoteInputOverlayVisible(true);

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

                res(highlightedHtmlString); 
            }, 0); // somehow necessary for states to update properly, 0 milliseconds is fine
        });
        
        setInputHighlighted(true);

        setIsNoteInputOverlayVisible(false);

        updateAppUserEntity();

        return highlightPromise;
    }


    /**
     * Remove highlighting of inputDiv content and parse ```<input>```s to inputVariableSequences.
     */
    async function unHighlightInputDivContent(): Promise<string> {

        const unHighlightedContent = await new Promise<string>((res, rej) => {
            const inputDiv = $(inputDivRef.current!);
            const inputHtml = inputDiv.html();

            // remove highlights
            let sanitizedInputHtml = sanitizeForInputDiv(inputHtml);

            // convert inputs
            sanitizedInputHtml = parseVariableInputToVariableInputSequence(sanitizedInputHtml);

            inputDiv.html(sanitizedInputHtml);

            setInputHighlighted(false);
            
            res(sanitizedInputHtml);
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

        while (alteredText.includes(VARIABLE_INPUT_START_SEQUENCE) && alteredText.includes(VARIABLE_INPUT_END_SEQUENCE)) {
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

        return getDefaultVariableInput(placeholder, getDefaultVariableInputWidth(placeholder));
    }


    /**
     * @param placeholder of input. Default is {@link VARIABLE_INPUT_DEFAULT_PLACEHOLDER}
     * @returns the width of a variableInput as if the ```placeholder``` was it's value and the width was 'fit-content'
     */
    function getDefaultVariableInputWidth(placeholder = VARIABLE_INPUT_DEFAULT_PLACEHOLDER): number {
        
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
        const inputDivChildDivs = inputDiv.find("div")
        const lastChildDiv = inputDivChildDivs.length ? inputDivChildDivs.last() : inputDiv;

        lastChildDiv.html(lastChildDiv.html() + getDefaultVariableInput(VARIABLE_INPUT_DEFAULT_PLACEHOLDER, getDefaultVariableInputWidth()));
    }

        
    /**
     * Appends a default ```$[[VARIABL_NAME]]``` sequence to the end of the inputDiv.
     */
    function appendVariableInputSequence(): void {

        const inputDiv = $(inputDivRef.current!);
        const inputDivChildDivs = inputDiv.find("div")
        const lastChildDiv = inputDivChildDivs.length ? inputDivChildDivs.last() : inputDiv;

        lastChildDiv.html(lastChildDiv.html() + VARIABLE_INPUT_START_SEQUENCE + VARIABLE_INPUT_DEFAULT_PLACEHOLDER + VARIABLE_INPUT_END_SEQUENCE);
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
     * @returns ```true``` if input div contains the placeholder, else ```false```
     */
    function hasPlaceholder(): boolean {

        return $(inputDivRef.current!).children().first().is(".placeholderInput");
    }


    /**
     * Set all noteInputEntity fields for this noteInput.
     */
    function updateAppUserEntity(): void {

        // value
        noteInputEntity.value = $(inputDivRef.current!).html();

        // programmingLanguage
        noteInputEntity.programmingLanguage = codeNoteInputWithVariablesLanguage;
    }


    async function handleFocus(event): Promise<void> {

        if (event.target.className !== "variableInput" && !hasPlaceholder())
            await unHighlightInputDivContent();
    }


    async function handleBlurCapture(event): Promise<void> {

        if (disabled)
            return;

        if (onBlur)
            onBlur(event);

        // case: focus was not on a variable input or the placeholder textarea
        if (!inputHighlighted && !hasPlaceholder())
            await highlightInputDivContent();
    }
    

    async function handleKeyDownCapture(event): Promise<void> {

        const keyName = event.key;
        
        if (isKeyPressed("Control") && isKeyPressed("Shift") && keyName === "V") {
            event.preventDefault();
            appendVariableInputSequence();
            
        } else if (keyName === "Control")
            sanitizeAndUpdateClipboardText();
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


    function activateFullScreenStyles(): void {

        const inputDiv = $(inputDivRef.current!);
        const defaultCodeNoteInput = inputDiv.parents(".DefaultCodeNoteInput");
        const inputDivContainer = inputDiv.parents(".inputDivContainer");

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        defaultCodeNoteInput.css({
            position: "fixed",
            zIndex: appOverlayZIndex + 1
        });

        defaultCodeNoteInput.animate({
            top: "10vh",
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
        const defaultCodeNoteInput = inputDiv.parents(".DefaultCodeNoteInput");
        const inputDivContainer = inputDiv.parents(".inputDivContainer");
        
        // move up just a little bit
        defaultCodeNoteInput.css({
            position: "relative",
            top: "30px",
        });
        
        // resize quickly
        defaultCodeNoteInput.css({
            width: "100%"
        });
        inputDivContainer.css({
            height: "100%"
        });
        inputDiv.css({
            maxHeight: "var(--codeNoteInputWithVariablesMinHeight)"
        })

        // animate to start pos
        defaultCodeNoteInput.animate(
            {
                top: 0,
            },
            300,
            "swing", 
            () => {
                // reset to initial styles
                defaultCodeNoteInput.css({
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

        updateAppUserEntity();
    }


    function isAutoDetectLanguage(): boolean {

        return codeNoteInputWithVariablesLanguage === CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE;
    }


    function handleAppendVariableButtonClick(event): void {

        appendVariableInput();
    }


    return (
        <Flex 
            id={id} 
            className={className + " fullWidth " + (isFullScreen && "fullScreen")}
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
                        onKeyUp={handleKeyUp}
                        onFocus={handleFocus}
                        onBlurCapture={handleBlurCapture}
                    >
                        { inputDivValue }
                    </ContentEditableDiv> 
                </code>
                
                <Overlay 
                    className="noteInputOverlay flexCenter" 
                    hideOnClick={false}
                    fadeInDuration={0}
                    isOverlayVisible={isNoteInputOverlayVisible} 
                    setIsOverlayVisible={setIsNoteInputOverlayVisible}
                >
                    <i className={"fa-solid fa-circle-notch rotating"}></i>
                </Overlay>
            </pre>

            <Flex horizontalAlign="right" flexWrap="nowrap" verticalAlign="start">
                {/* NoteInput Settings */}
                <NoteInputSettings noteInputEntity={noteInputEntity} areNoteInputSettingsDisabled={areNoteInputSettingsDisabled} />

                {/* Add variable */}
                <Button 
                    className="appendVariableButton defaultNoteInputButton" 
                    title="Append variable (Ctrl + Shift + V)"
                    onClick={handleAppendVariableButtonClick}
                >
                    <i className="fa-solid fa-dollar-sign"></i>
                </Button>
                
                {/* Fullscreen */}
                <Button 
                    className="fullScreenButton defaultNoteInputButton"
                    title={isFullScreen ? "Normal screen" : "Fullscreen"}
                    onClick={toggleFullScreen}
                >
                    {isFullScreen ?
                        <i className="fa-solid fa-down-left-and-up-right-to-center"></i> :
                        <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
                    }
                </Button>
                
                {/* Copy */}
                <Button
                    className="defaultNoteInputButton copyButton"
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