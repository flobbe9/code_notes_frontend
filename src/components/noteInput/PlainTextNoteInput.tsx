import parse from 'html-react-parser';
import $ from "jquery";
import React, { ClipboardEvent, useContext, useEffect, useRef, useState } from "react";
import sanitize from "sanitize-html";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { NoteInputEntity } from "../../abstract/entites/NoteInputEntity";
import HelperProps from "../../abstract/HelperProps";
import "../../assets/styles/PlainTextNoteInput.scss";
import { DEFAULT_HTML_SANTIZER_OPTIONS } from "../../helpers/constants";
import { getClipboardText, getCssConstant, isBlank, isEventKeyTakingUpSpace, setClipboardText } from "../../helpers/utils";
import { useInitialStyles } from "../../hooks/useInitialStyles";
import { AppContext } from '../App';
import Button from "../helpers/Button";
import ContentEditableDiv from "../helpers/ContentEditableDiv";
import Flex from "../helpers/Flex";
import Overlay from '../helpers/Overlay';
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
    
    const [inputDivJQuery, setInputDivJQuery] = useState<JQuery>($());
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

    const inputDivRef = useRef<HTMLDivElement>(null);

    
    useInitialStyles(inputDivJQuery, [["max-width", "width"]], 100);


    useEffect(() => {
        setInputDivJQuery($(inputDivRef.current!));

        setInputDivValue(parse(sanitize(noteInputEntity.value, DEFAULT_HTML_SANTIZER_OPTIONS)));

        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});

    }, []);


    function handleFocus(event): void {
        
        if (onFocus)
            onFocus(event);

        // convert <code> sequences to ```
        $(inputDivRef.current!).html(parseCodeHtmlToCodeText());
    }


    async function handleBlur(event): Promise<void> {

        if (onBlur)
            onBlur(event);

        const inputDiv = $(inputDivRef.current!);

        // case: no placeholder present
        if (!isBlank(inputDiv.text())) {
            const parsedText = await parseCodeTextToCodeHtml();
            inputDiv.html(parsedText);
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
                const inputDiv = $(inputDivRef.current!);
                const inputText = inputDiv.html();
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
        
        updateAppUserEntity();
        
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

        const inputDiv = $(inputDivRef.current!);
        let inputHtml = inputDiv.html();

        let newInputText = inputHtml
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

        if (isEventKeyTakingUpSpace(keyName) && !isControlKeyPressed())
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


    function updateAppUserEntity(): void {

        noteInputEntity.value = $(inputDivRef.current!).html();
    }


    function cleanUpEmptyInputDiv(event): void {

        const inputDiv = $(inputDivRef.current!);
        const inputBreaks = inputDiv.find("br");
        
        // case: no content left
        if (isBlank(inputDiv.text()) && inputBreaks.length <= 1)
            // clean up empty tags
            inputDiv.html("");
    }


    async function handleCopyClick(event): Promise<void> {

        animateCopyIcon();

        setClipboardText(inputDivRef.current!.textContent || "");
    }


    function activateFullScreenStyles(): void {

        const inputDiv = $(inputDivRef.current!);
        const plainTextNoteInput = inputDiv.parents(".PlainTextNoteInput");

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        plainTextNoteInput.css({
            position: "fixed",
            zIndex: appOverlayZIndex + 1
        });

        plainTextNoteInput.animate({
            height: "80vh",
            top: "10vh",
            width: "90vw"
        });
    }


    function deactivateFullScreenStyles(): void {

        const inputDiv = $(inputDivRef.current!);
        const plainTextNoteInput = inputDiv.parents(".PlainTextNoteInput");
        
        // move up just a little bit
        plainTextNoteInput.css({
            height: "unset",
            position: "relative",
            top: "30px",
        });
        
        // resize quickly
        plainTextNoteInput.css({
            width: "100%"
        });

        // animate to start pos
        plainTextNoteInput.animate(
            {
                top: 0,
            },
            300,
            "swing", 
            () => {
                // reset to initial styles
                plainTextNoteInput.css({
                    position: "static",
                    top: "auto",
                    zIndex: 0
                });
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

            {/* Copy button */}
            <Button
                className="defaultNoteInputButton copyButton"
                title="Copy"
                onClick={handleCopyClick}
            >
                <i className="fa-solid fa-copy"></i>
                <i className="fa-solid fa-copy"></i>
            </Button>

            <Button 
                className="deleteNoteButton defaultNoteInputButton" 
                title="Delete section"
                onClick={handleDeleteNote}
            >
                <i className="fa-solid fa-xmark fa-lg"></i>
            </Button>

            {children}
        </Flex>
    )
}