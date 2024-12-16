import hljs from "highlight.js";
import parse from 'html-react-parser';
import React, { ClipboardEvent, useContext, useEffect, useRef, useState } from "react";
import sanitize from "sanitize-html";
import { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import HelperProps from "../../../../abstract/HelperProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import "../../../../assets/styles/CodeNoteInputWithVariables.scss";
import "../../../../assets/styles/highlightJs/vs.css";
import { CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE, CODE_INPUT_FULLSCREEN_ANIMATION_DURATION, DEFAULT_HTML_SANTIZER_OPTIONS, getDefaultVariableInput, VARIABLE_INPUT_DEFAULT_PLACEHOLDER, VARIABLE_INPUT_END_SEQUENCE, VARIABLE_INPUT_SEQUENCE_REGEX, VARIABLE_INPUT_START_SEQUENCE } from "../../../../helpers/constants";
import { animateAndCommit, cleanUpSpecialChars, getClipboardText, getCssConstant, getCSSValueAsNumber, getTextWidth, isBlank, isEventKeyTakingUpSpace, setClipboardText } from "../../../../helpers/utils";
import { useInitialStyles } from "../../../../hooks/useInitialStyles";
import { AppContext } from "../../../App";
import Button from "../../../helpers/Button";
import ContentEditableDiv from "../../../helpers/ContentEditableDiv";
import Flex from "../../../helpers/Flex";
import Overlay from "../../../helpers/Overlay";
import { DefaultCodeNoteInputContext } from "./DefaultCodeNoteInput";
import { DefaultNoteInputContext } from "./DefaultNoteInput";
import { NoteContext } from "./Note";
import NoteInputSettings from "./NoteInputSettings";


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
    
    const [hasComponentRendered, sethasComponentRendered] = useState(false);

    const [inputHighlighted, setInputHighlighted] = useState(true);
    
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "CodeNoteInputWithVariables");
    
    const componentRef = useRef<HTMLDivElement>(null);
    const inputDivRef = useRef<HTMLDivElement>(null);

    const { isKeyPressed, isControlKeyPressed } = useContext(AppContext);
    const { noteEdited } = useContext(NoteContext);
    const { 
        codeNoteInputWithVariablesLanguage, 
        isNoteInputOverlayVisible,
        setIsNoteInputOverlayVisible, 
        areNoteInputSettingsDisabled, 
        animateCopyIcon,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,
        isFullScreen,
        handleDeleteNote
    } = useContext(DefaultNoteInputContext);
    const { componentRef: defaultCodeNoteInputRef } = useContext(DefaultCodeNoteInputContext);


    useInitialStyles(inputDivRef.current, [["max-width", "width"]], 100);

    
    useEffect(() => {

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
                const inputDiv = inputDivRef.current!;
                const inputChildren = inputDiv.children;

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
                Array.from(inputChildren).forEach(inputChild => {
                    const child = inputChild as HTMLElement;
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

                inputDiv.innerHTML = highlightedHtmlString;

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
            const inputDiv = inputDivRef.current!;
            const inputHtml = inputDiv.innerHTML;

            // remove highlights
            let sanitizedInputHtml = sanitizeForInputDiv(inputHtml);

            // convert inputs
            sanitizedInputHtml = parseVariableInputToVariableInputSequence(sanitizedInputHtml);

            inputDiv.innerHTML = sanitizedInputHtml;

            setInputHighlighted(false);
            
            res(sanitizedInputHtml);
        });

        return unHighlightedContent;
    }


    /**
     * @returns plain text of the very first line of the content editable which is not wrapped inside a ```<div>```
     */
    function getFirstInputDivContentLine(): string {

        const inputDiv = inputDivRef.current!;
        let inputHtml = inputDiv.innerHTML;

        // case: no html tags inside inputDiv
        if (!inputHtml.includes("<"))
            inputHtml = inputDiv.innerText;
        
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

        return !isBlank(str) && str.replaceAll("\n", "\\n").match(VARIABLE_INPUT_SEQUENCE_REGEX) !== null;
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

        const inputDiv = inputDivRef.current!;
        const inputDivChildDivs = inputDiv.querySelectorAll("div");
        const lastChildDiv = inputDivChildDivs.length ? inputDivChildDivs.item(inputDivChildDivs.length - 1) : inputDiv;

        lastChildDiv.innerHTML = (lastChildDiv.innerHTML + getDefaultVariableInput(VARIABLE_INPUT_DEFAULT_PLACEHOLDER, getDefaultVariableInputWidth()));
    }

        
    /**
     * Appends a default ```$[[VARIABL_NAME]]``` sequence to the end of the inputDiv.
     */
    function appendVariableInputSequence(): void {

        const inputDiv = inputDivRef.current!;
        const inputDivChildDivs = inputDiv.querySelectorAll("div");
        const lastChildDiv = inputDivChildDivs.length ? inputDivChildDivs.item(inputDivChildDivs.length - 1) : inputDiv;

        lastChildDiv.innerHTML = lastChildDiv.innerHTML + VARIABLE_INPUT_START_SEQUENCE + VARIABLE_INPUT_DEFAULT_PLACEHOLDER + VARIABLE_INPUT_END_SEQUENCE;
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
     * Sanitize and update clipboard text (if allowed) in order to paste plain text into inputs instead of styled html.
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

        const inputDiv = inputDivRef.current!;
        let inputDivHtml = inputDiv.innerHTML;

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

        inputDivRef.current!.querySelectorAll("input")
            .forEach((element) => {
                const input = element as HTMLInputElement;
                if (input.type === "text")
                    values.push(input.value)
            });

        return values;
    }


    /**
     * Set all noteInputEntity fields for this noteInput.
     */
    function updateAppUserEntity(): void {

        // value
        noteInputEntity.value = inputDivRef.current!.innerHTML;

        // programmingLanguage
        noteInputEntity.programmingLanguage = codeNoteInputWithVariablesLanguage;
    }


    async function handleFocus(event): Promise<void> {

        if (event.target.className !== "variableInput")
            await unHighlightInputDivContent();
    }


    async function handleBlurCapture(event): Promise<void> {

        if (disabled)
            return;

        if (onBlur)
            onBlur(event);

        // case: focus was not on a variable input or the placeholder textarea
        if (!inputHighlighted)
            await highlightInputDivContent();
    }
    

    async function handleKeyDownCapture(event): Promise<void> {

        const keyName = event.key;
        
        if (isKeyPressed("Control") && isKeyPressed("Shift") && keyName === "V") {
            event.preventDefault();
            appendVariableInputSequence();
            noteEdited();
        }

        if (isEventKeyTakingUpSpace(keyName) && !isControlKeyPressed())
            noteEdited();
    }
    

    function handleCut(event: ClipboardEvent): void {
        
        noteEdited();
    }


    function handlePaste(event: ClipboardEvent): void {

        noteEdited();
    }

 
    function handleKeyUp(event): void {

        const keyName = event.key;

        if (keyName === "Backspace" || keyName === "Delete")
            cleanUpEmptyInputDiv(event);
    }


    function cleanUpEmptyInputDiv(event): void {

        const inputDiv = inputDivRef.current!;
        const inputBreaks = inputDiv.querySelectorAll("br");
        
        // case: no content left
        if (isBlank(inputDiv.innerText) && inputBreaks.length <= 1)
            // clean up empty tags
            inputDiv.innerHTML = "";
    }


    function handleInputDivContainerClick(event): void {

        const inputDiv = inputDivRef.current!;

        // case: not focuesd yet and not clicking a variableInput
        if (!inputDiv.matches(":focus") && event.target.className !== "variableInput")
            // focus input div
            inputDiv.focus();
    }


    async function handleCopyClick(event): Promise<void> {

        animateCopyIcon();

        await copyInputDivContentToClipboard();
    }


    function activateFullScreenStyles(): void {

        const inputDiv = inputDivRef.current!;
        const defaultCodeNoteInput = defaultCodeNoteInputRef.current!;
        const inputDivContainer = componentRef.current!.querySelector(".inputDivContainer") as HTMLElement;

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        defaultCodeNoteInput.style.position = "fixed";
        defaultCodeNoteInput.style.zIndex = appOverlayZIndex + 1;
        defaultCodeNoteInput.style.width = "90vw";

        animateAndCommit(
            defaultCodeNoteInput,
            [{ top: window.getComputedStyle(defaultCodeNoteInput).getPropertyValue("top") }, { top: "10vh" }], 
            { duration: CODE_INPUT_FULLSCREEN_ANIMATION_DURATION }
        );

        animateAndCommit(
            inputDivContainer, 
            [{ height: window.getComputedStyle(defaultCodeNoteInput).getPropertyValue("height") }, { height: "80vh" }], 
            { duration: CODE_INPUT_FULLSCREEN_ANIMATION_DURATION}
        );

        animateAndCommit(inputDiv, { maxHeight: "80vh" });
    }


    function deactivateFullScreenStyles(): void {

        const inputDiv = inputDivRef.current!;
        const defaultCodeNoteInput = defaultCodeNoteInputRef.current!;
        const inputDivContainer = componentRef.current!.querySelector(".inputDivContainer") as HTMLElement;

        // move up just a little bit
        defaultCodeNoteInput.style.position = "relative";
        defaultCodeNoteInput.style.top = "30px";
        
        // resize quickly
        defaultCodeNoteInput.style.width = "100%";

        inputDivContainer.style.height = "100%";
        inputDiv.style.maxHeight = "var(--codeNoteInputWithVariablesMinHeight)";

        // animate to start pos
        animateAndCommit(
            defaultCodeNoteInput,
            { top: 0 },
            { duration: 300 },
            () => {
                // reset to initial styles
                defaultCodeNoteInput.style.position = "static";
                defaultCodeNoteInput.style.top = "auto";
                defaultCodeNoteInput.style.zIndex = "0";
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
            ref={componentRef}
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
                        onCut={handleCut}
                        onPaste={handlePaste}
                    >
                        {inputDivValue}
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

            <div className="CodeNoteInputWithVariables-buttonContainer">
                <Flex horizontalAlign="right" flexWrap="nowrap" verticalAlign="start">
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

                    {/* Delete */}
                    <Button 
                        className="deleteNoteButton defaultNoteInputButton" 
                        title="Delete section"
                        onClick={handleDeleteNote}
                    >
                        <i className="fa-solid fa-xmark fa-lg"></i>
                    </Button>
                </Flex>

                <Flex horizontalAlign="right" flexWrap="nowrap">
                    {/* Add variable */}
                    <Button 
                        className="appendVariableButton defaultNoteInputButton" 
                        title="Append variable (Ctrl + Shift + V)"
                        onClick={handleAppendVariableButtonClick}
                    >
                        <i className="fa-solid fa-dollar-sign"></i>
                    </Button>

                    {/* NoteInput Settings */}
                    <NoteInputSettings noteInputEntity={noteInputEntity} areNoteInputSettingsDisabled={areNoteInputSettingsDisabled} />
                </Flex>
            </div>
            
            {children}
        </Flex>
    )
}