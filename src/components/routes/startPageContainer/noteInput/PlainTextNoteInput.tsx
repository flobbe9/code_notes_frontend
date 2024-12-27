import parse from 'html-react-parser';
import React, { ClipboardEvent, useContext, useEffect, useRef, useState } from "react";
import sanitize from "sanitize-html";
import { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import HelperProps from "../../../../abstract/HelperProps";
import "../../../../assets/styles/PlainTextNoteInput.scss";
import { CODE_INPUT_FULLSCREEN_ANIMATION_DURATION, DEFAULT_HTML_SANTIZER_OPTIONS } from "../../../../helpers/constants";
import { animateAndCommit, getClipboardText, getCssConstant, isBlank, isEventKeyTakingUpSpace, setClipboardText } from "../../../../helpers/utils";
import { useInitialStyles } from "../../../../hooks/useInitialStyles";
import { AppContext } from '../../../App';
import Button from "../../../helpers/Button";
import ContentEditableDiv from "../../../helpers/ContentEditableDiv";
import Flex from "../../../helpers/Flex";
import Overlay from '../../../helpers/Overlay';
import { DefaultNoteInputContext } from "./DefaultNoteInput";
import { NoteContext } from './Note';


interface Props extends HelperProps {

    noteInputEntity: NoteInputEntity
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
    
    const [inputDivValue, setInputDivValue] = useState<any>()

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "PlainTextNoteInput");
    const { isControlKeyPressed } = useContext(AppContext);
    const { noteEdited } = useContext(NoteContext);
    const { 
        isNoteInputOverlayVisible,
        setIsNoteInputOverlayVisible, 
        animateCopyIcon,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,
        isFullScreen,
        handleDeleteNote
    } = useContext(DefaultNoteInputContext);

    const componentRef = useRef<HTMLDivElement>(null);
    const inputDivRef = useRef<HTMLDivElement>(null);

    
    useInitialStyles(inputDivRef.current, [["max-width", "width"]], 100);


    useEffect(() => {
        setInputDivValue(parse(sanitize(noteInputEntity.value, DEFAULT_HTML_SANTIZER_OPTIONS)));

        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});

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

        const inputDiv = inputDivRef.current!;

        // case: no placeholder present
        if (!isBlank(inputDiv.innerText)) {
            const parsedText = await parseCodeTextToCodeHtml();
            inputDiv.innerHTML = parsedText;
            noteInputEntity.value = parsedText;
        }
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
                const inputTextArray = inputText.split("```");
            
                // case: too short to have code noteInputs or no code noteInputs at all
                if (inputText.length <= 6 || inputTextArray.length <= 2) {
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
        newInputText = newInputText.replaceAll("<code>", "```");
        newInputText = newInputText.replaceAll("</code>", "```");

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


    function handleKeyDownCapture(event): void {

        const keyName = event.key;

        if (keyName === "Control")
            sanitizeClipboardText();

        if (isEventKeyTakingUpSpace(keyName, true, true) && !isControlKeyPressed())
            noteEdited();
    }


    function handleKeyUp(event): void {

        if (disabled)
            return;

        if (onKeyUp)
            onKeyUp(event);

        const keyName = event.key;

        if (keyName === "Backspace" || keyName === "Delete")
            cleanUpEmptyInputDiv(event);
    }


    function handleCut(event: ClipboardEvent): void {
        
        noteEdited();
    }


    function handlePaste(event: ClipboardEvent): void {

        noteEdited();
    }


    function cleanUpEmptyInputDiv(event): void {

        const inputDiv = inputDivRef.current!;
        const inputBreaks = inputDiv.querySelectorAll("br");
        
        // case: no content left
        if (isBlank(inputDiv.innerText) && inputBreaks.length <= 1)
            // clean up empty tags
            inputDiv.innerHTML = "";
    }


    async function handleCopyClick(event): Promise<void> {

        animateCopyIcon();

        setClipboardText(inputDivRef.current!.textContent || "");
    }


    function activateFullScreenStyles(): void {

        const plainTextNoteInput = componentRef.current!;

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        plainTextNoteInput.style.position = "fixed";
        plainTextNoteInput.style.width = "90vw";
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
                title={isFullScreen ? "Normal screen" : "Fullscreen"}
                onClick={toggleFullScreen}
            >
                {isFullScreen ?
                    <i className="fa-solid fa-down-left-and-up-right-to-center"></i> :
                    <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
                }
            </Button>

            {children}
        </Flex>
    )
}