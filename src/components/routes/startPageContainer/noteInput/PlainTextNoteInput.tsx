import parse from 'html-react-parser';
import React, { KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import sanitize from "sanitize-html";
import { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import HelperProps from "../../../../abstract/HelperProps";
import "../../../../assets/styles/PlainTextNoteInput.scss";
import { CODE_INPUT_FULLSCREEN_ANIMATION_DURATION, CODE_SNIPPET_SEQUENCE, DEFAULT_HTML_SANTIZER_OPTIONS } from "../../../../helpers/constants";
import { getContentEditableDivLineElements, moveCursor } from '../../../../helpers/projectUtils';
import { animateAndCommit, getClipboardText, getCssConstant, insertString, isBlank, isEventKeyTakingUpSpace, logWarn, setClipboardText } from "../../../../helpers/utils";
import { useInitialStyles } from "../../../../hooks/useInitialStyles";
import { AppContext } from '../../../App';
import Button from "../../../helpers/Button";
import ContentEditableDiv from "../../../helpers/ContentEditableDiv";
import Flex from "../../../helpers/Flex";
import Overlay from '../../../helpers/Overlay';
import { DefaultNoteInputContext } from "./DefaultNoteInput";
import { NoteContext } from './Note';


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
    ...props}: Props) {
    
    const [inputDivValue, setInputDivValue] = useState<any>();
    /** ```[cursorIndex, cursorLineNumber]``` inside this input. ```cursorIndex``` is 0-based, ```cursorLineNumber``` is 1-based */
    const [cursorPos, setCursorPos] = useState([0, 1]);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "PlainTextNoteInput");
    const { isKeyPressed } = useContext(AppContext);
    const { updateNoteEdited } = useContext(NoteContext);
    const { 
        isNoteInputOverlayVisible,
        setIsNoteInputOverlayVisible, 
        animateCopyIcon,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,
        isFullScreen,
        handleDeleteNote,
        focusOnRender
    } = useContext(DefaultNoteInputContext);

    const componentRef = useRef<HTMLDivElement>(null);
    const inputDivRef = useRef<HTMLDivElement>(null);

    
    useInitialStyles(inputDivRef.current, [["max-width", "width"]], 100);


    useEffect(() => {
        setInputDivValue(parse(sanitize(noteInputEntity.value, DEFAULT_HTML_SANTIZER_OPTIONS)));

        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});

        if (focusOnRender)
            inputDivRef.current?.focus();

    }, []);


    function handleFocus(event): void {
        
        if (onFocus)
            onFocus(event);

        // convert <code> sequences to ```
        inputDivRef.current!.innerHTML = parseCodeHtmlToCodeText();
    }


    async function handleBlur(event): Promise<void> {

        if (onBlur)
            onBlur(event);

        const parsedText = await parseCodeTextToCodeHtml();

        inputDivRef.current!.innerHTML = parsedText;

        updateNoteInputEntity(parsedText);
    }


    async function updateNoteInputEntity(parsedText?: string): Promise<void> {

        noteInputEntity.value = parsedText ?? await parseCodeTextToCodeHtml();
    }


    /**
     * Parses inner text of inputDiv replacing with ```"``````"``` with ```<code></code>```. Will consider
     * unclosed code sequences.
     * 
     * Wont actually update the inputDiv's inner html.
     * 
     * @returns parsed inner html of inputDiv
     */
    async function parseCodeTextToCodeHtml(): Promise<string> {

        setIsNoteInputOverlayVisible(true);

        const parsedText = await new Promise<string>((res, rej) => {
            setTimeout(() => {
                const inputDiv = inputDivRef.current!;
                const inputText = inputDiv.innerHTML;
                const inputTextArray = inputText.split(CODE_SNIPPET_SEQUENCE);
            
                // case: no code noteInputs at all
                if (inputTextArray.length <= 2) {
                    res(inputText);
                    return;
                }
                    
                let inputHtmlString = "";
            
                inputTextArray.forEach((text, i) => {
                    const isEvenIndex = i % 2 === 0;
            
                    // case: not inside a code noteInput
                    if (i === 0 || i === inputTextArray.length - 1 || isEvenIndex)
                        inputHtmlString += text;
            
                    // case: inside a code noteInput
                    else if (!isEvenIndex)
                        inputHtmlString += "<code>" + text + "</code>";
                })

                res(inputHtmlString);
            }, 0); // somehow necessary for states to update properly, 0 milliseconds is fine
        });

        // sanitize
        const sanitizedInputDivValue = sanitize(parsedText, DEFAULT_HTML_SANTIZER_OPTIONS);
        
        setIsNoteInputOverlayVisible(false);

        return sanitizedInputDivValue;
    }


    /**
     * Parses inner html of inputDiv replacing ```<code></code>``` with ```"``````"```. 
     * 
     * Wont actually update the inputDiv's inner text.
     * 
     * @returns parsed inner text of inputDiv
     */
    function parseCodeHtmlToCodeText(): string {

        const inputDiv = inputDivRef.current!;
        let inputHtml = inputDiv.innerHTML;

        let newInputText = inputHtml;
        newInputText = newInputText.replaceAll("<code>", CODE_SNIPPET_SEQUENCE);
        newInputText = newInputText.replaceAll("</code>", CODE_SNIPPET_SEQUENCE);

        return newInputText;
    }
        

    /**
     * Sanitize clipboard text (if allowed) in order to paste plain text in inputs instead of styled html.
     */
    async function sanitizeClipboardText(): Promise<void> {

        // get clipboard text
        let clipboardText = await getClipboardText();

        // case: nothing copied or permission denied by browser
        if (isBlank(clipboardText))
            return;

        // remove styles
        clipboardText = sanitize(clipboardText, {
            allowedTags: ["div", "br"],
            allowedAttributes: {}
        });
        // remove special chars
        clipboardText = cleanUpHtml(clipboardText);

        await setClipboardText(clipboardText);
    }
    

    /**
     * @param html html string
     * @returns same html string but with some special chars replaced. Does not alter given string
     */
    function cleanUpHtml(html: string): string {

        let cleanHtml = html;
        cleanHtml = cleanHtml.replaceAll("&amp;", "&");
        cleanHtml = cleanHtml.replaceAll("&lt;", "<");
        cleanHtml = cleanHtml.replaceAll("&gt;", ">");
        cleanHtml = cleanHtml.replaceAll("&nbsp;", " ");

        return cleanHtml;
    }


    function handleKeyDownCapture(event: KeyboardEvent): void {

        const keyName = event.key;

        if (keyName === "Control")
            sanitizeClipboardText();
                
        if (isKeyPressed("Control") && isKeyPressed("Shift") && keyName === "V") {
            event.preventDefault();
            insertVariableInputSequence();
            updateNoteEdited();
        }
    }


    function handleKeyUp(event: KeyboardEvent): void {

        if (disabled)
            return;

        if (onKeyUp)
            onKeyUp(event);

        const keyName = event.key;

        if (keyName === "Backspace" || keyName === "Delete")
            cleanUpEmptyInputDiv();
        
        if (isEventKeyTakingUpSpace(keyName, true, true))
            updateNoteEdited();
    }


    function handleCut(): void {
        
        updateNoteEdited();
    }


    function handlePaste(): void {

        updateNoteEdited();
    }


    function cleanUpEmptyInputDiv(): void {

        const inputDiv = inputDivRef.current!;
        const inputBreaks = inputDiv.querySelectorAll("br");
        
        // case: no content left
        if (isBlank(inputDiv.innerText) && inputBreaks.length <= 1)
            // clean up empty tags
            inputDiv.innerHTML = "";
    }


    async function handleCopyClick(): Promise<void> {

        animateCopyIcon();

        setClipboardText(inputDivRef.current!.textContent || "");
    }


    function activateFullScreenStyles(): void {

        const plainTextNoteInput = componentRef.current!;

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        plainTextNoteInput.style.position = "fixed";
        plainTextNoteInput.style.width = "90vw";
        // center
        plainTextNoteInput.style.left = "5vw";
        plainTextNoteInput.style.zIndex = appOverlayZIndex + 1;

        animateAndCommit(
            plainTextNoteInput,
            [
                { height: window.getComputedStyle(plainTextNoteInput).getPropertyValue("height"), top: window.getComputedStyle(plainTextNoteInput).getPropertyValue("top") }, 
                { height: "80vh", top: "10vh" }
            ], 
            { duration: CODE_INPUT_FULLSCREEN_ANIMATION_DURATION },
        );
    }


    function deactivateFullScreenStyles(): void {

        const plainTextNoteInput = componentRef.current!;
        
        // move up just a little bit
        plainTextNoteInput.style.height = "unset";
        plainTextNoteInput.style.position = "relative";
        plainTextNoteInput.style.top = "30px";
        plainTextNoteInput.style.width = "100%";
        
        plainTextNoteInput.style.left = "auto";
        
        // animate to start pos
        animateAndCommit(
            plainTextNoteInput,
            { top: 0 },
            { duration: CODE_INPUT_FULLSCREEN_ANIMATION_DURATION },
            () => {
                // reset to initial styles
                plainTextNoteInput.style.position = "static";
                plainTextNoteInput.style.top = "auto";
                plainTextNoteInput.style.zIndex = "0";
            }
        )
    }

    
    /**
     * Appends a default ```<input>``` to the end of the inputDiv.
     */
    function appendVariableInput(): void {

        const inputDiv = inputDivRef.current!;
        const inputDivChildDivs = inputDiv.querySelectorAll("div");
        const lastChildDiv = inputDivChildDivs.length ? inputDivChildDivs.item(inputDivChildDivs.length - 1) : inputDiv;

        lastChildDiv.innerHTML = (lastChildDiv.innerHTML + "<code>code</code>");
    }

    
    /**
     * Inserts a default ```$[[VARIABL_NAME]]``` sequence at current cursor pos.
     */
    function insertVariableInputSequence(): void {

        const variableInputSequence = CODE_SNIPPET_SEQUENCE + CODE_SNIPPET_SEQUENCE;
        
        let currentCursorIndex = cursorPos[0];
        let currentCursorLineNum = cursorPos[1];
        
        // all inner divs that represent a line
        const inputInnerDivs = getContentEditableDivLineElements(inputDivRef.current!);
        const isFirstLineADiv = inputDivRef.current!.innerHTML.startsWith("<div>")
        const currentInputDiv = inputInnerDivs[currentCursorLineNum - 1 - (isFirstLineADiv ? 0 : 1)] as HTMLDivElement; // - 2 for item() beeing 0-based and the first line not beeing a div
        const numInutLines = inputInnerDivs.length + (isFirstLineADiv ? 0 : 1); 

        if (currentCursorIndex === -1 || currentCursorLineNum === -1) {
            logWarn("Failed to get cursor index or cursor line num");
            // assume cursor at end of input value
            currentCursorIndex = inputDivRef.current!.innerText.length - 1;
            currentCursorLineNum = numInutLines;
        }

        // case: is first line, not a div
        if (!currentInputDiv) {
            inputDivRef.current!.innerHTML = insertString(
                inputDivRef.current!.innerHTML,
                variableInputSequence, 
                currentCursorIndex
            );

        // case: is empty line
        } else if (!!currentInputDiv.querySelector("br")) 
            currentInputDiv.innerHTML = variableInputSequence;

        else {
            currentInputDiv.innerText = insertString(
                currentInputDiv.innerText,
                variableInputSequence, 
                currentCursorIndex
            );
        }

        // select placeholder sequence
        moveCursor(currentInputDiv || inputDivRef.current!, currentCursorIndex + 3);
    }
    

    function handleAppendCodeSnippet(): void {

        appendVariableInput();
        updateNoteInputEntity();
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
            <pre className="inputDivContainer fullWidth">
                <ContentEditableDiv 
                    className="plainTextInput fullWidth" 
                    spellCheck={false} 
                    setCursorPos={setCursorPos}
                    ref={inputDivRef}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDownCapture={handleKeyDownCapture}
                    onKeyUp={handleKeyUp}
                    onCut={handleCut}
                    onPaste={handlePaste}
                >
                    {inputDivValue}
                </ContentEditableDiv>
                                
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
                        className="deleteNoteButton defaultNoteInputButton" 
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
                    {/* Add code highlighted text */}
                    <Button 
                        className="mt-2 defaultNoteInputButton" 
                        title="Code snippet (Ctrl + Shift + V)"
                        onClick={handleAppendCodeSnippet}
                    >
                        <i className="fa-solid fa-code dontSelectText"></i>
                    </Button>
                </Flex>
            </div>

            {children}
        </Flex>
    )
}