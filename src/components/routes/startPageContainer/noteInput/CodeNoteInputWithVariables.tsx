import { CursorPosition } from "@/abstract/CursorPosition";
import { CODE_BLOCK_WITH_VARIABLES_AUTO_DETECT_LANGUAGE } from "@/abstract/ProgrammingLanguage";
import HiddenInput from "@/components/helpers/HiddenInput";
import TextareaDiv, { getTextareaDivDivElement, getTextareaDivTextareaElement, TextareaDivMode } from "@/components/helpers/TextareaDiv";
import { useHasComponentMounted } from "@/hooks/useHasComponentMounted";
import hljs from "highlight.js";
import React, { FormEvent, KeyboardEvent, MouseEvent, useContext, useEffect, useRef, useState } from "react";
import sanitize from "sanitize-html";
import { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import HelperProps from "../../../../abstract/HelperProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import "../../../../assets/styles/highlightJs/vs.css";
import { getDefaultVariableInput, TEXTAREA_DIV_WHITESPACE_HTML, VARIABLE_INPUT_CLASS, VARIABLE_INPUT_DEFAULT_PLACEHOLDER, VARIABLE_INPUT_END_SEQUENCE, VARIABLE_INPUT_START_SEQUENCE } from "../../../../helpers/constants";
import { logError, logWarn } from "../../../../helpers/logUtils";
import { getCursorIndex, getCursorPos, getTextWidth, moveCursor } from "../../../../helpers/projectUtils";
import { getCssConstant, getCSSValueAsNumber, insertString, isBlank, setClipboardText, stringToHtmlElement } from "../../../../helpers/utils";
import { AppContext } from "../../../App";
import Button from "../../../helpers/Button";
import Flex from "../../../helpers/Flex";
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
    const [inputDefaultValue, setInputDefaultValue] = useState<string>()
    /** The last known cursor position. This state is only updated on blur, not on change. Use `getCursorPos()` instead */
    const [lastCursorPos, setLastCursorPos] = useState<CursorPosition>({x: 0, y: 1, selectedChars: 0});
    
    const [inputMode, setInputMode] = useState<TextareaDivMode>("div");

    const hasMounted = useHasComponentMounted();
    
    const componentName = "CodeNoteInputWithVariables";
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, componentName);
    
    const componentRef = useRef<HTMLDivElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);

    const { isKeyPressed } = useContext(AppContext);
    const { updateNoteEdited, isSaveButtonDisabled, clickSaveButton } = useContext(NoteContext);
    const { 
        codeNoteInputWithVariablesLanguage, 
        areNoteInputSettingsDisabled, 
        animateCopyIcon,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,
        isFullScreen,
        handleDeleteNote,
        focusOnRender
    } = useContext(DefaultNoteInputContext);
    const { componentRef: defaultCodeNoteInputRef } = useContext(DefaultCodeNoteInputContext);

    useEffect(() => {
        updateInputDefaultValueState();

        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});
    }, []);

    useEffect(() => {
        handleLanguageChange();
    }, [codeNoteInputWithVariablesLanguage]);

    async function updateInputDefaultValueState(): Promise<void> {
        let defaultValue = noteInputEntity?.value;

        // only parse if not converting back to textarea anyway 
        if (!focusOnRender) 
            defaultValue = await parseDivInnerHtml(noteInputEntity?.value);

        setInputDefaultValue(defaultValue);

        if (focusOnRender)
            setTimeout(() => {
                focusInput();
            }, 10); // default text would disappear otherwise
    }
    
    /**
     * @param text plain non-html text
     * @returns highlighted and then sanitized html string (using {@link DEFAULT_HTML_SANTIZER_OPTIONS})
     */
    function highlightPlainText(text: string): string {
        let highlightedText = text;
        if (isAutoDetectLanguage())
            highlightedText = hljs.highlightAuto(text).value;

        else
            highlightedText = hljs.highlight(text, { language: codeNoteInputWithVariablesLanguage }).value;

        return highlightedText;
    }

    /**
     * @param textareaValue 
     * @param textarea 
     * @returns highlighted input value (div innerHtml) replacing `<input />`s with input sequences
     */
    async function parseDivInnerHtml(textareaValue: string, _textarea?: HTMLTextAreaElement): Promise<string> {
        if (isBlank(textareaValue))
            // empty divs have slightly less height, so put a whitespace inside
            return TEXTAREA_DIV_WHITESPACE_HTML;

        let divInnerHtml = textareaValue;
        divInnerHtml = await highlightAndReplaceVariableInputSequences(divInnerHtml);
        // replace line breaks that are inside a sequence. 
        divInnerHtml = divInnerHtml.replaceAll("\n", "<br>");

        // append the weird span with a whitespace because a div ending with a <br> element will only render it if there's content after 
        if (divInnerHtml.endsWith("<br>"))
            divInnerHtml += TEXTAREA_DIV_WHITESPACE_HTML;

        return divInnerHtml;
    }

    /**
     * @param divInnerHtml 
     * @param _div 
     * @returns unhighlighted input value (textarea value) replacing input sequences with `<inputs>`. Blank string if falsy args
     */
    async function parseTextareaValue(divInnerHtml: string, _div?: HTMLDivElement): Promise<string> {
        if (isBlank(divInnerHtml))
            return "";

        // remove hacky whitespace
        divInnerHtml = divInnerHtml.replaceAll(TEXTAREA_DIV_WHITESPACE_HTML, "");
        divInnerHtml = divInnerHtml.replaceAll("<br>", "\n");
        // only leave <input> elements and their "placeholder" attribute behind
        divInnerHtml = sanitize(divInnerHtml, {
            allowedTags: ["input"],
            allowedAttributes: {"input": ["placeholder"]}
        }); 
        divInnerHtml = divInnerHtml.replaceAll("<input ", VARIABLE_INPUT_START_SEQUENCE);
        divInnerHtml = divInnerHtml.replaceAll("placeholder=\"", "");
        divInnerHtml = divInnerHtml.replaceAll("\" />", VARIABLE_INPUT_END_SEQUENCE);

        // decode html unicodes
        divInnerHtml = stringToHtmlElement(divInnerHtml).textContent;

        return divInnerHtml;
    }

    /**
     * Calls {@link highlightAndReplaceVariableInputSequence()} until all `$[[]]` sequences are replaced.
     * 
     * @param text plain, non-html text
     * @returns the highlighted html string possibly with `<input>`s
     */
    async function highlightAndReplaceVariableInputSequences(text: string): Promise<string> {
        // result string
        let highlightedText = "";

        while (text.includes(VARIABLE_INPUT_START_SEQUENCE) && text.includes(VARIABLE_INPUT_END_SEQUENCE)) {
            // highlight string before sequence
            const textBeforeSequence = text.substring(0, text.indexOf(VARIABLE_INPUT_START_SEQUENCE));
            highlightedText += highlightPlainText(textBeforeSequence);

            // replace first sequence with variable input
            highlightedText += parseVariableInput(text);

            // ignore "]]", continue after sequence
            text = text.substring(text.indexOf(VARIABLE_INPUT_END_SEQUENCE) + VARIABLE_INPUT_END_SEQUENCE.length);
        }

        // highlight text after last "]]"
        return Promise.resolve(highlightedText + highlightPlainText(text));
    }

    /**
     * Find first occurrence of variableInputSequence and parse that to a variableInput. 
     * 
     * @param text possibly with a value inside the brackets
     * @returns only the `<input>` passing the value of the `$[[]]` sequence as placeholder (or "" if `$[[]]` not found)
     */
    function parseVariableInput(text: string): string {
        const openingSequenceStartIndex = text.indexOf(VARIABLE_INPUT_START_SEQUENCE);
        const openingSequenceEndIndex = text.indexOf(VARIABLE_INPUT_END_SEQUENCE);

        let placeholder = text.substring(openingSequenceStartIndex + VARIABLE_INPUT_START_SEQUENCE.length, openingSequenceEndIndex);
    
        // case: invalid variable sequence
        if (openingSequenceStartIndex === -1 || openingSequenceEndIndex === -1)
            placeholder = "";

        placeholder = placeholder.replaceAll("\n", "");
        placeholder = placeholder.trim();

        return getDefaultVariableInput(placeholder, getVariableInputWidth(placeholder));
    }

    /**
     * @param placeholder of input. Default is {@link VARIABLE_INPUT_DEFAULT_PLACEHOLDER}
     * @returns the width of a variableInput as if the `placeholder` was it's value and the width was 'fit-content'
     */
    function getVariableInputWidth(placeholder = VARIABLE_INPUT_DEFAULT_PLACEHOLDER): number {
        const placeholderWidth = getTextWidth(placeholder, getCssConstant("variableInputFontSize"), getCssConstant("variableInputFontFamily"));
        const variableInputPadding = getCSSValueAsNumber(getCssConstant("variableInputPaddingLeftRight"), 2) * 2;
        const variableInputBorderWidth = getCSSValueAsNumber(getCssConstant("variableInputBorderWidth"), 2) * 2;

        return placeholderWidth + variableInputPadding + variableInputBorderWidth;
    }
        
    /**
     * Inserts a default `$[[VARIABL_NAME]]` sequence at current cursor pos.
     * 
     * @param position the cursorIndex to insert the sequence at. Will try to get the current cursor pos if not specified
     */
    function insertVariableInputSequence(position?: number): void {
        const textarea = getTextarea()!;
        const variableInputSequence = VARIABLE_INPUT_START_SEQUENCE + VARIABLE_INPUT_DEFAULT_PLACEHOLDER + VARIABLE_INPUT_END_SEQUENCE;
        
        let cursorIndex = position ?? getCursorIndex(textarea);
        if (cursorIndex === -1) {
            cursorIndex = textarea.value.length;
            logWarn("Failed to get cursor index. Inserting variableInputSequence at the end of the input");
        }
        
        textarea.value = insertString(textarea.value, variableInputSequence, cursorIndex);
        handleChange();

        // select placeholder sequence
        moveCursor(
            textarea,
            {
                x: cursorIndex + VARIABLE_INPUT_START_SEQUENCE.length, 
                y: 0, // not used for textareas
                selectedChars: VARIABLE_INPUT_DEFAULT_PLACEHOLDER.length
            }
        );
    }

    /**
     * Copy content of inputDiv to clipboard replacing `<input>`s with their value.
     */
    async function copyInputDivContentToClipboard(): Promise<void> {
        let inputDivHtml = "";

        // get the div input value
        let inputElement: HTMLDivElement | HTMLTextAreaElement | null = null;
        if ((inputElement = getTextarea()))
            inputDivHtml = await parseDivInnerHtml(inputElement.value);

        else if ((inputElement = getInputDiv()))
            inputDivHtml = inputElement.innerHTML;

        else {
            logError("Failed to copy input value to clipboard. Neither input is neither div nor textarea");
            return;
        }
        
        if (isBlank(inputDivHtml))
            return;

        inputDivHtml = inputDivHtml!.replaceAll("<br>", "\n");
        // only leave <input> elements
        inputDivHtml = sanitize(inputDivHtml, {
            allowedTags: ["input"],
            allowedAttributes: {}
        });
        
        // replace each <input> with their value
        const variableInputValues = getVariableInputValues();
        const inputDivHtmlArray = inputDivHtml.split("<input />");
        inputDivHtml = inputDivHtmlArray.reduce((prev, curr, i) => prev + variableInputValues[i - 1] + curr);

        await setClipboardText(inputDivHtml);
    }

    /**
     * @returns list of values of variableInputs inside inputDiv
     */
    function getVariableInputValues(): string[] {
        return Array.from(getInputDiv()!.querySelectorAll(`input.${VARIABLE_INPUT_CLASS}`))
            .map((element) => (element as HTMLInputElement).value);
    }

    async function handleKeyDownCapture(event: KeyboardEvent): Promise<void> {
        const keyName = event.key;

        if (isKeyPressed("Control") && isKeyPressed("Shift") && keyName === "V") {
            event.preventDefault();
            insertVariableInputSequence();
        }

        // save this note
        if (isKeyPressed("Control") && event.key === "s" && !isSaveButtonDisabled) {
            event.preventDefault();

            clickSaveButton();
        }
    }

    async function handleCopyClick(): Promise<void> {
        animateCopyIcon();

        await copyInputDivContentToClipboard();
    }

    function activateFullScreenStyles(): void {
        const defaultCodeNoteInput = defaultCodeNoteInputRef.current!;
        const inputDivContainer = inputContainerRef.current!;

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        defaultCodeNoteInput.style.position = "fixed";
        defaultCodeNoteInput.style.zIndex = appOverlayZIndex + 1;
        defaultCodeNoteInput.style.width = "90vw";
        // center
        defaultCodeNoteInput.style.left = "5vw";
        defaultCodeNoteInput.style.top = "10vh";
        inputDivContainer.style.height = "80vh";
        inputDivContainer.style.maxHeight = "80vh";

        focusInput();
    }

    function deactivateFullScreenStyles(): void {
        const defaultCodeNoteInput = defaultCodeNoteInputRef.current!;
        const inputDivContainer = inputContainerRef.current!;
        
        // resize quickly
        defaultCodeNoteInput.style.width = "100%";
        
        defaultCodeNoteInput.style.left = "auto";
        inputDivContainer.style.height = "100%";
        inputDivContainer.style.maxHeight = "var(--noteInputMaxHeight)";
        defaultCodeNoteInput.style.position = "static";
        defaultCodeNoteInput.style.top = "auto";
        defaultCodeNoteInput.style.zIndex = "0";
        
        focusInput();
    }

    async function handleLanguageChange(): Promise<void> {
        // case: called on load
        if (!hasMounted)
            return;

        // "rehighlight"
        const inputDiv = getInputDiv()!;
        const unhighlighted = await parseTextareaValue(inputDiv.innerHTML);
        const highlighted = await parseDivInnerHtml(unhighlighted);

        inputDiv.innerHTML = highlighted;

        noteInputEntity.programmingLanguage = codeNoteInputWithVariablesLanguage;
        updateNoteEdited();
    }

    function isAutoDetectLanguage(): boolean {
        return codeNoteInputWithVariablesLanguage === CODE_BLOCK_WITH_VARIABLES_AUTO_DETECT_LANGUAGE;
    }

    /**
     * Insert a variableInput sequence at the last known cursor pos or at the end. Use {@link insertVariableInputSequence}
     */
    async function handleInsertVariableButtonClick(): Promise<void> {
        await focusInput();

        insertVariableInputSequence(lastCursorPos.x);
    }

    /**
     * @see {@link getTextareaDivDivElement}
     */
    function getInputDiv(): HTMLDivElement | null {
        return getTextareaDivDivElement(componentRef.current);
    }

    /**
     * @see {@link getTextareaDivTextareaElement}
     */
    function getTextarea(): HTMLTextAreaElement | null {
        return getTextareaDivTextareaElement(componentRef.current);
    }

    function handleInputMouseEvent(event: MouseEvent): void {
        // make sure not to convert to textarea on click on variable input
        if (event.target instanceof HTMLInputElement && (event.target as HTMLInputElement).classList.contains(VARIABLE_INPUT_CLASS))
            throw new Error("Dont convert to textarea");
    }

    /**
     * Await this in order to make sure that the textarea is rendered:
     * 
     * ```
     * await focusInput();
     * const textarea = getTextarea()!; // not null
     * ```
     */
    async function focusInput(): Promise<void> {
        const inputDiv = getInputDiv()!;
        inputDiv.click();
        
        // this is how long it should take for the textarea to be rendered
        await parseTextareaValue(inputDiv.innerHTML);
    }

    function handleChange(_event?: FormEvent<HTMLTextAreaElement>): void {
        const textarea = getTextarea()!;
        noteInputEntity.value = textarea.value;

        updateNoteEdited();
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
            {/* For focusing the input */}
            <HiddenInput 
                onFocus={focusInput} 
                tabIndex={inputMode === "textarea" ? -1 : 0} // make that "tab back" will not refocus the input
            />

            {/* Input */}
            <div className="inputContainer" ref={inputContainerRef}>
                <TextareaDiv 
                    parseDiv={parseDivInnerHtml}
                    parseTextarea={parseTextareaValue}
                    defaultValue={inputDefaultValue}
                    setMode={setInputMode}
                    onChange={handleChange}
                    onBlurCapture={(e) => setLastCursorPos(getCursorPos(e.target))}
                    onKeyDownCapture={handleKeyDownCapture}
                    onMouseDown={handleInputMouseEvent}
                    onClick={handleInputMouseEvent}
                />
            </div>

            {/* Controls */}
            <div className={`${componentName}-buttonContainer`}>
                <Flex horizontalAlign="right" flexWrap="nowrap" verticalAlign="start">
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
                        className="defaultNoteInputButton" 
                        title="Delete section"
                        onClick={handleDeleteNote}
                    >
                        <i className="fa-solid fa-xmark fa-lg"></i>
                    </Button>
                    
                    {/* Fullscreen */}
                    <Button 
                        className="fullScreenButton defaultNoteInputButton"
                        title={isFullScreen ? "Resize (Escape)" : "Fullscreen"}
                        onClick={toggleFullScreen}
                    >
                        {isFullScreen ?
                            <i className="fa-solid fa-down-left-and-up-right-to-center"></i> :
                            <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
                        }
                    </Button>

                    {/* Add variable */}
                    <Button 
                        className={`${componentName}-buttonContainer-appendVariableButton defaultNoteInputButton`}
                        title="Variable (Ctrl + Shift + V)"
                        onClick={handleInsertVariableButtonClick}
                    >
                        <i className="fa-solid fa-dollar-sign"></i>
                    </Button>

                    {/* NoteInput Settings */}
                    <NoteInputSettings className="me-1" noteInputEntity={noteInputEntity} areNoteInputSettingsDisabled={areNoteInputSettingsDisabled} />
                </Flex>
            </div>
            
            {children}
        </Flex>
    )
}
