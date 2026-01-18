import { CursorPosition } from "@/abstract/CursorPosition";
import { CODE_BLOCK_WITH_VARIABLES_AUTO_DETECT_LANGUAGE } from "@/abstract/ProgrammingLanguage";
import TextareaDiv from "@/components/helpers/TextareaDiv";
import hljs from "highlight.js";
import parse from 'html-react-parser';
import React, { KeyboardEvent, MouseEvent, useContext, useEffect, useRef, useState } from "react";
import sanitize from "sanitize-html";
import { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import HelperProps from "../../../../abstract/HelperProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import "../../../../assets/styles/highlightJs/vs.css";
import { DEFAULT_HTML_SANTIZER_OPTIONS, getDefaultVariableInput, VARIABLE_INPUT_CLASS, VARIABLE_INPUT_DEFAULT_PLACEHOLDER, VARIABLE_INPUT_END_SEQUENCE, VARIABLE_INPUT_SEQUENCE_REGEX, VARIABLE_INPUT_START_SEQUENCE } from "../../../../helpers/constants";
import { logWarn } from "../../../../helpers/logUtils";
import { getCursorIndex, getCursorPos, getTextWidth, moveCursor } from "../../../../helpers/projectUtils";
import { getCssConstant, getCSSValueAsNumber, insertString, isBlank, setClipboardText } from "../../../../helpers/utils";
import { useInitialStyles } from "../../../../hooks/useInitialStyles";
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
// TODO
    // dont turn example html code into & unicode on parseTextarea?
    // update noteEdited state on change?
    // can't tab focus input because i'ts a div
        // put a hidden input in front
export default function CodeNoteInputWithVariables({
    noteInputEntity,
    disabled,
    onBlur, 
    ...props
}: Props) {
    const [inputDivValue, setInputDivValue] = useState<any>()
    /** The last known cursor position. This state is only updated on blur, not on change. Use `getCursorPos()` instead */
    const [lastCursorPos, setLastCursorPos] = useState<CursorPosition>({x: 0, y: 1, selectedChars: 0});
    
    const [hasComponentRendered, sethasComponentRendered] = useState(false);
    
    const componentName = "CodeNoteInputWithVariables";
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, componentName);
    
    const componentRef = useRef<HTMLDivElement>(null);
    const inputDivRef = useRef<HTMLDivElement | HTMLTextAreaElement>(null);

    const { isKeyPressed } = useContext(AppContext);
    const { updateNoteEdited, isSaveButtonDisabled, clickSaveButton } = useContext(NoteContext);
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
        handleDeleteNote,
        focusOnRender
    } = useContext(DefaultNoteInputContext);
    const { componentRef: defaultCodeNoteInputRef } = useContext(DefaultCodeNoteInputContext);


    useInitialStyles(inputDivRef.current, [["max-width", "width"]], 100);

    
    useEffect(() => {

        setInputDivValue(parse(sanitize(noteInputEntity.value, DEFAULT_HTML_SANTIZER_OPTIONS)));

        sethasComponentRendered(true);

        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});

        if (focusOnRender)
            setTimeout(() => 
                inputDivRef.current?.focus(), 10); // default text will be removed otherwise
    }, []);


    useEffect(() => {
        handleLanguageChange();
    }, [codeNoteInputWithVariablesLanguage]);
    
    
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
            return "";

        textareaValue = await highlightAndReplaceVariableInputSequences(textareaValue);
        // replace line breaks that are inside a sequence
        textareaValue = textareaValue.replaceAll("\n", "<br>");

        return textareaValue;
    }

    /**
     * @param divInnerHtml 
     * @param _div 
     * @returns unhighlighted input value (textarea value) replacing input sequences with `<inputs>`. Blank string if falsy args
     */
    async function parseTextareaValue(divInnerHtml: string, _div?: HTMLDivElement): Promise<string> {
        if (isBlank(divInnerHtml))
            return "";

        divInnerHtml = divInnerHtml.replaceAll("<br>", "\n");
        // only leave <input> elements and their "placeholder" attribute behind
        divInnerHtml = sanitize(divInnerHtml, {
            allowedTags: ["input"],
            allowedAttributes: {"input": ["placeholder"]}
        }); 
        divInnerHtml = divInnerHtml.replaceAll("<input ", VARIABLE_INPUT_START_SEQUENCE);
        divInnerHtml = divInnerHtml.replaceAll("placeholder=\"", "");
        divInnerHtml = divInnerHtml.replaceAll("\" />", VARIABLE_INPUT_END_SEQUENCE);

        return divInnerHtml;
    }

    /**
     * Indicates whether given `str` includes variable input sequence that is to be replaced with a variable `<input>`.
     * 
     * @param str to check
     * @returns `true` if given `str` includes a `$[[` followed by a `]]`. See {@link VARIABLE_INPUT_SEQUENCE_REGEX}
     */
    function includesVariableInputSequence(str: string): boolean {
        return !isBlank(str) && str.replaceAll("\n", "\\n").match(VARIABLE_INPUT_SEQUENCE_REGEX) !== null;
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
    // TODO: 
        // edge case 
            // is text selected
    function insertVariableInputSequence(position?: number): void {
        const textarea = getTextarea()!;
        const variableInputSequence = VARIABLE_INPUT_START_SEQUENCE + VARIABLE_INPUT_DEFAULT_PLACEHOLDER + VARIABLE_INPUT_END_SEQUENCE;
        
        let cursorIndex = position ?? getCursorIndex(textarea);
        if (cursorIndex === -1) {
            cursorIndex = textarea.value.length;
            logWarn("Failed to get cursor index. Inserting variableInputSequence at the end of the input");
        }
        
        textarea.value = insertString(textarea.value, variableInputSequence, cursorIndex);

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
        let inputDivHtml = getInputDiv()?.innerHTML;
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

    /**
     * Set all noteInputEntity fields for this noteInput.
     */
    function updateNoteInputEntity(): void {
        // value
        noteInputEntity.value = inputDivRef.current!.innerHTML;

        // programmingLanguage
        noteInputEntity.programmingLanguage = codeNoteInputWithVariablesLanguage;
    }
    
    async function handleKeyDownCapture(event: KeyboardEvent): Promise<void> {
        const keyName = event.key;

        if (isKeyPressed("Control") && isKeyPressed("Shift") && keyName === "V") {
            event.preventDefault();
            insertVariableInputSequence();
            // updateNoteEdited();
        }

        // if (isEventKeyTakingUpSpace(keyName, true, true) && !isControlKeyPressed(["Shift"]) && !isVariableInputFocused())
        //     updateNoteEdited();

        // save this note
        if (isKeyPressed("Control") && event.key === "s" && !isSaveButtonDisabled) {
            event.preventDefault();

            // TODO: reconsider timing and whether to highlight
            // highlight to properly save
            // if (!isInputHighlighted)
            //     await highlightInputDivContent();

            // clickSaveButton();

            // // unhighlight
            // if (!isInputHighlighted)
            //     await unHighlightInputDivContent();

            // // move cursor back
            // const cursorPosition = getCursorPos(getTextarea()!);
            // moveCursor(getTextarea()!, cursorPosition);
        }
    }

    async function handleCopyClick(): Promise<void> {
        animateCopyIcon();

        await copyInputDivContentToClipboard();
    }

    // TODO
    function activateFullScreenStyles(): void {
        const inputDiv = inputDivRef.current!;
        const defaultCodeNoteInput = defaultCodeNoteInputRef.current!;
        const inputDivContainer = componentRef.current!.querySelector(".inputDivContainer") as HTMLElement;

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        defaultCodeNoteInput.style.position = "fixed";
        defaultCodeNoteInput.style.zIndex = appOverlayZIndex + 1;
        defaultCodeNoteInput.style.width = "90vw";
        // center
        defaultCodeNoteInput.style.left = "5vw";
        defaultCodeNoteInput.style.top = "10vh";
        inputDivContainer.style.height = "80vh";
        inputDiv.style.maxHeight = "80vh";
    }

    // TODO
    function deactivateFullScreenStyles(): void {
        const inputDiv = inputDivRef.current!;
        const defaultCodeNoteInput = defaultCodeNoteInputRef.current!;
        const inputDivContainer = componentRef.current!.querySelector(".inputDivContainer") as HTMLElement;

        // move up just a little bit
        defaultCodeNoteInput.style.position = "relative";
        defaultCodeNoteInput.style.top = "30px";
        
        // resize quickly
        defaultCodeNoteInput.style.width = "100%";
        
        defaultCodeNoteInput.style.left = "auto";
        inputDivContainer.style.height = "100%";
        inputDiv.style.maxHeight = "var(--noteInputMaxHeight)";
        defaultCodeNoteInput.style.position = "static";
        defaultCodeNoteInput.style.top = "auto";
        defaultCodeNoteInput.style.zIndex = "0";

        inputDiv.focus();
    }

    async function handleLanguageChange(): Promise<void> {
        // case: called on load
        if (!hasComponentRendered)
            return;

        // "rehighlight"
        const inputDiv = getInputDiv()!;
        const unhighlighted = await parseTextareaValue(inputDiv.innerHTML);
        const highlighted = await parseDivInnerHtml(unhighlighted);

        inputDiv.innerHTML = highlighted;

        updateNoteInputEntity();
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
        
        updateNoteInputEntity();
        updateNoteEdited();
    }

    /**
     * @returns the textareaDiv element assuming that it's currently rendered as textarea. `null` if it is not
     */
    function getTextarea(): HTMLTextAreaElement | null {
        const textareaDiv = componentRef.current!.querySelector(".TextareaDiv");
        if (!textareaDiv || !(textareaDiv instanceof HTMLTextAreaElement)) {
            logWarn(`Invalid access of textareaDiv ref. Not a textarea element right now: ${textareaDiv}`);
            return null;
        }

        return textareaDiv;
    }

    /**
     * @returns the inputDiv element assuming that it's currently rendered as div. `null` if it is not
     */
    function getInputDiv(): HTMLDivElement | null {
        const inputDiv = componentRef.current!.querySelector(".TextareaDiv");
        if (!inputDiv || !(inputDiv instanceof HTMLDivElement)) {
            logWarn(`Invalid access of inputDiv ref. Not a textarea element right now: ${inputDiv}`);
            return null;
        }

        return inputDiv;
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

    return (
        <Flex 
            id={id} 
            className={className + " fullWidth " + (isFullScreen && "fullScreen")}
            style={style}
            flexWrap="nowrap"
            ref={componentRef}
            {...otherProps}
        >
            <TextareaDiv 
                parseDiv={parseDivInnerHtml}
                parseTextarea={parseTextareaValue}
                defaultValue={inputDivValue}
                ref={inputDivRef}
                onBlurCapture={(e) => setLastCursorPos(getCursorPos(e.target))}
                onKeyDownCapture={handleKeyDownCapture}
                onMouseDown={handleInputMouseEvent}
                onClick={handleInputMouseEvent}
            />

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
                </Flex>

                <Flex horizontalAlign="right" flexWrap="nowrap">
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
