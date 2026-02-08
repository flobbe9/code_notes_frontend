import HiddenInput from '@/components/helpers/HiddenInput';
import TextareaDiv, { getTextareaDivDivElement, getTextareaDivTextareaElement, TextareaDivMode } from '@/components/helpers/TextareaDiv';
import { FormEvent, KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import HelperProps from "../../../../abstract/HelperProps";
import { CODE_SNIPPET_SEQUENCE_MULTILINE, CODE_SNIPPET_SEQUENCE_MULTILINE_HTML_END, CODE_SNIPPET_SEQUENCE_MULTILINE_HTML_START, CODE_SNIPPET_SEQUENCE_SINGLELINE, CODE_SNIPPET_SEQUENCE_SINGLELINE_HTML_END, CODE_SNIPPET_SEQUENCE_SINGLELINE_HTML_START, TEXTAREA_DIV_WHITESPACE_HTML } from "../../../../helpers/constants";
import { logError, logWarn } from '../../../../helpers/logUtils';
import { getCursorIndex, moveCursor } from '../../../../helpers/projectUtils';
import { getCssConstant, insertString, isBlank, setClipboardText, stringToHtmlElement } from "../../../../helpers/utils";
import { AppContext } from '@/context/AppContext';
import Button from "../../../helpers/Button";
import Flex from "../../../helpers/Flex";
import { DefaultNoteInputContext } from "@/context/DefaultNoteInputContext";
import { NoteContext } from '@/context/NoteContext';


interface Props extends HelperProps {
    noteInputEntity: NoteInputEntity,
}

/**
 * @since 0.0.1
 */
export default function PlainTextNoteInput({
    noteInputEntity,
    disabled,
    onFocus,
    onBlur,
    onKeyUp,
    ...props
}: Props) {
    const [inputDefaultValue, setInputDefaultValue] = useState<string>()
    const [inputMode, setInputMode] = useState<TextareaDivMode>("div");

    const componentName = "PlainTextNoteInput";
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, componentName);
    const { isKeyPressed } = useContext(AppContext);
    const { updateNoteEdited, isSaveButtonDisabled, clickSaveButton } = useContext(NoteContext);
    const { 
        animateCopyIcon,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,
        isFullScreen,
        handleDeleteNote,
        focusOnRender,
    } = useContext(DefaultNoteInputContext);

    const componentRef = useRef<HTMLDivElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        updateInputDefaultValueState();
    
        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});
    }, []);

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
     * @param textareaValue 
     * @param textarea 
     * @returns highlighted input value (div innerHtml) replacing html 'code' sequences
     */
    async function parseDivInnerHtml(textareaValue: string, _textarea?: HTMLTextAreaElement): Promise<string> {
        if (isBlank(textareaValue))
            // empty divs have slightly less height, so put a whitespace inside
            return TEXTAREA_DIV_WHITESPACE_HTML;

        let divInnerHtml = textareaValue;
        divInnerHtml = await replacePlainTextCodeSequences(divInnerHtml);
        // replace line breaks that are inside a sequence. 
        divInnerHtml = divInnerHtml.replaceAll("\n", "<br>");

        // append the weird span with a whitespace because a div ending with a <br> element will only render it if there's content after 
        if (divInnerHtml.endsWith("<br>"))
            divInnerHtml += TEXTAREA_DIV_WHITESPACE_HTML;

        return divInnerHtml;
    }

    /**
     * Parses `textareaValue` replacing plain text 'code' sequences with html 'code' sequences. Will consider
     * unclosed code sequences.
     * 
     * Wont actually update the inputDiv's inner html.
     * 
     * @param textareaValue to parse
     * @returns parsed inner html of inputDiv
     */
    async function replacePlainTextCodeSequences(textareaValue: string): Promise<string> {
        const parseCallback = (codeText: string, snippetSequence: string, htmlStartSequence: string, htmlEndSequence: string): string => {
            const snippetContents = codeText.split(snippetSequence);
        
            // case: no code snippets at all
            if (snippetContents.length <= 2)
                return codeText;
                
            let codeHtml = "";
        
            snippetContents.forEach((snippetContent, i) => {
                const isEvenIndex = i % 2 === 0;
        
                // case: not inside a code snippet
                if (i === 0 || i === snippetContents.length - 1 || isEvenIndex)
                    codeHtml += snippetContent;
        
                // case: inside a code snippet
                else if (!isEvenIndex)
                    codeHtml += `${htmlStartSequence}${snippetContent}${htmlEndSequence}`;
            })

            return codeHtml;
        }
        
        let parsed = parseCallback(textareaValue, CODE_SNIPPET_SEQUENCE_MULTILINE, CODE_SNIPPET_SEQUENCE_MULTILINE_HTML_START, CODE_SNIPPET_SEQUENCE_MULTILINE_HTML_END);
        parsed = parseCallback(parsed, CODE_SNIPPET_SEQUENCE_SINGLELINE, CODE_SNIPPET_SEQUENCE_SINGLELINE_HTML_START, CODE_SNIPPET_SEQUENCE_SINGLELINE_HTML_END);
        return Promise.resolve(parsed);
    }

    /**
     * Parses `divInnerHtml` to plain text replacing html code sequences with plain text code sequences.
     * 
     * Wont actually update the inputDiv's inner text.
     * 
     * @param divInnerHtml to parse
     * @returns parsed inner text of inputDiv
     */
    async function parseTextareaValue(divInnerHtml: string): Promise<string> {
        let newInputText = divInnerHtml;

        // remove hacky whitespace
        newInputText = newInputText.replaceAll(TEXTAREA_DIV_WHITESPACE_HTML, "");

        // multiline
        newInputText = newInputText.replaceAll(CODE_SNIPPET_SEQUENCE_MULTILINE_HTML_START, CODE_SNIPPET_SEQUENCE_MULTILINE);
        newInputText = newInputText.replaceAll(CODE_SNIPPET_SEQUENCE_MULTILINE_HTML_END, CODE_SNIPPET_SEQUENCE_MULTILINE);

        // single line
        newInputText = newInputText.replaceAll(CODE_SNIPPET_SEQUENCE_SINGLELINE_HTML_START, CODE_SNIPPET_SEQUENCE_SINGLELINE);
        newInputText = newInputText.replaceAll(CODE_SNIPPET_SEQUENCE_SINGLELINE_HTML_END, CODE_SNIPPET_SEQUENCE_SINGLELINE);

        // line breaks
        newInputText = newInputText.replaceAll("<br>", "\n");

        // parse html unicodes
        newInputText = stringToHtmlElement(newInputText).textContent;

        return Promise.resolve(newInputText);
    }

    async function handleKeyDownCapture(event: KeyboardEvent): Promise<void> {
        const keyName = event.key;

        if (isKeyPressed("Control") && isKeyPressed("Shift") && keyName === "V") {
            event.preventDefault();
            insertCodeSnippetSequence();
        }
        
        if (isKeyPressed("Control") && event.key === "s" && !isSaveButtonDisabled) {
            event.preventDefault();
            clickSaveButton();
        }
    }

    /**
     * Update clipboard text (if allowed) with textarea value.
     */
    async function handleCopyClick(): Promise<void> {
        animateCopyIcon();

        let plainTextInputValue = "";

        // get textarea value
        let inputElement: HTMLDivElement | HTMLTextAreaElement | null = null;
        if ((inputElement = getTextarea()))
            plainTextInputValue = inputElement.value;

        else if ((inputElement = getInputDiv()))
            plainTextInputValue = await parseTextareaValue(inputElement.innerHTML);

        else {
            logError("Failed to copy input value to clipboard. Neither input is neither div nor textarea");
            return;
        }
        
        await setClipboardText(plainTextInputValue);
    }

    function activateFullScreenStyles(): void {
        const plainTextNoteInput = componentRef.current!;
        // const defaultCodeNoteInput = defaultCodeNoteInputRef.current!;
        const inputDivContainer = inputContainerRef.current!;

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        plainTextNoteInput.style.position = "fixed";
        plainTextNoteInput.style.zIndex = appOverlayZIndex + 1;
        plainTextNoteInput.style.width = "90vw";
        plainTextNoteInput.style.height = "80vh";
        inputDivContainer.style.maxHeight = "80vh";
        // center
        plainTextNoteInput.style.left = "5vw";
        plainTextNoteInput.style.top = "10vh";

        focusInput();
    }

    function deactivateFullScreenStyles(): void {
        const plainTextNoteInput = componentRef.current!;
        const inputDivContainer = inputContainerRef.current!;
        
        // resize quickly
        plainTextNoteInput.style.width = "100%";
        plainTextNoteInput.style.left = "auto";
        plainTextNoteInput.style.position = "static";
        plainTextNoteInput.style.top = "auto";
        plainTextNoteInput.style.zIndex = "0";
        plainTextNoteInput.style.height = "100%";

        inputDivContainer.style.maxHeight = "var(--noteInputMaxHeight)";

        focusInput();
    }
    
    /**
     * Inserts a plain text 'code' sequence at current cursor pos.
     */
    function insertCodeSnippetSequence(): void {
        const textarea = getTextarea()!;
        const variableInputSequence = CODE_SNIPPET_SEQUENCE_SINGLELINE + CODE_SNIPPET_SEQUENCE_SINGLELINE;
        
        let cursorIndex = getCursorIndex(textarea);
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
                x: cursorIndex + CODE_SNIPPET_SEQUENCE_SINGLELINE.length, 
                y: 0, // not used for textareas
                selectedChars: 0
            }
        );
    }

    /**
     * @see {@link insertCodeSnippetSequence}
     */
    async function handleInsertPlainTextCodeSequence(): Promise<void> {
        await focusInput();

        insertCodeSnippetSequence();
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
            className={className + "" + (isFullScreen && " fullScreen")}
            style={style}
            verticalAlign="start"
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
                    // ref={inputDivRef}
                    setMode={setInputMode}
                    onChange={handleChange}
                    onKeyDownCapture={handleKeyDownCapture}
                />
            </div>
                    
            <div className="CodeNoteInputWithVariables-buttonContainer">
                <Flex horizontalAlign="right" flexWrap="nowrap" verticalAlign="start">
                    {/* Copy */}
                    <Button
                        className="defaultNoteInputButton copyButton"
                        title="Copy"
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

                    {/* Add code highlighted text */}
                    <Button 
                        className="me-1 defaultNoteInputButton" 
                        title="Code snippet (Ctrl + Shift + V)"
                        onClick={handleInsertPlainTextCodeSequence}
                    >
                        <i className="fa-solid fa-code dontSelectText"></i>
                    </Button>
                </Flex>
            </div>

            {children}
        </Flex>
    )
}
