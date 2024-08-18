import React, { useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/PlainTextBlock.scss";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import ContentEditableDiv from "../helpers/ContentEditableDiv";
import Flex from "../helpers/Flex";
import { cleanUpSpecialChars, getClipboardText, isBlank, log, setClipboardText } from "../../helpers/utils";
import sanitize from "sanitize-html";
import { DEFAULT_HTML_SANTIZER_OPTIONS } from "../../helpers/constants";
import { AppContext } from "../App";
import { useInitialStyles } from "../../hooks/useInitialStyles";
import { NoteInput } from "../../abstract/entites/NoteInput";
import { BlockContainerContext } from "./BlockContainer";
import HelperProps from "../../abstract/HelperProps";
import parse from 'html-react-parser';
import { DefaultBlockContext } from "./DefaultBlock";
import Button from "../helpers/Button";
import { DefaultCodeBlockContext } from "./DefaultCodeBlock";


interface Props extends HelperProps {

    noteInput: NoteInput
}


/**
 * @since 0.0.1
 */
// TODO: 
    // add something like a tutorial note with highlighted text 
        // on account creation?
        // if app user has no plain text notes at all && on create
    // dont add any default text

export default function PlainTextBlock({
    noteInput,
    disabled,
    onFocus,
    onBlur,
    onKeyUp,
    ...props}: Props) {
    
    const [inputDivJQuery, setInputDivJQuery] = useState<JQuery>($());
    const [parsing, setParsing] = useState(false);
    const [inputDivValue, setInputDivValue] = useState<any>()

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "PlainTextBlock");

    const { 
        getAppOverlayZIndex
    } = useContext(AppContext);

    const { numBlocksParsing, setNumBlocksParsing } = useContext(BlockContainerContext);
    
    const { 
        setBlockOverlayVisible, 
        animateCopyIcon,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,
        isFullScreen
    } = useContext(DefaultBlockContext);

    const inputDivRef = useRef(null);

    
    useInitialStyles(inputDivJQuery, [["max-width", "width"]], 100);


    useEffect(() => {
        setInputDivJQuery($(inputDivRef.current!));

        setInputDivValue(parse(sanitize(noteInput.value, DEFAULT_HTML_SANTIZER_OPTIONS)));

        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});

    }, []);


    useEffect(() => {
        updateNumBlocksParsing();

    }, [parsing]);


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

        // notify parsing process has started (should not take long here)
        setParsing(true);
        setBlockOverlayVisible(true);

        const parsedText = await new Promise<string>((res, rej) => {
            setTimeout(() => {
                const inputDiv = $(inputDivRef.current!);
                const inputText = inputDiv.html();
                const inputTextArray = inputText.split("```");
            
                // case: too short to have code blocks or no code blocks at all
                if (inputText.length <= 6 || inputTextArray.length <= 2) {
                    res(inputText);
                    return;
                }
                    
                let inputHtmlString = "";
            
                inputTextArray.forEach((text, i) => {
                    const isEvenIndex = i % 2 === 0;
            
                    // case: not inside a code block
                    if (i === 0 || i === inputTextArray.length - 1 || isEvenIndex)
                        inputHtmlString += text;
            
                    // case: inside a code block
                    else if (!isEvenIndex)
                        inputHtmlString += "<code>" + text + "</code>";
                })

                res(inputHtmlString);
            }, 100); // wait for states to update
        });

        // sanitize
        const sanitizedInputDivValue = sanitize(parsedText, DEFAULT_HTML_SANTIZER_OPTIONS);
        
        updateAppUser();
        
        setTimeout(() => {
            setParsing(false);
            setBlockOverlayVisible(false);

        }, 1); // states wont update correctly without this

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


    function updateAppUser(): void {

        noteInput.value = $(inputDivRef.current!).html();
    }


    /**
     * Increase the ```numBlocksParsing``` by 1 if block is currently parsing, or else decrease it by 1 
     * (but never go below 0).
     */
    function updateNumBlocksParsing(): void {

        if (parsing)
            setNumBlocksParsing(numBlocksParsing + 1);
        
        else if (numBlocksParsing > 0)
            setNumBlocksParsing(numBlocksParsing - 1);
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

        setClipboardText(getInputDivValueWithoutAnyHightlights());
    }


    /**
     * @returns the input div's inner html without the ```<code>``` or ``` highlights.
     */
    function getInputDivValueWithoutAnyHightlights(): string {

        const inputDiv = $(inputDivRef.current!);
        let inputDivHtml = inputDiv.html();

        inputDivHtml = inputDivHtml.replaceAll("<code>", "");
        inputDivHtml = inputDivHtml.replaceAll("</code>", "");

        return inputDivHtml;
    }


    function activateFullScreenStyles(): void {

        const inputDiv = $(inputDivRef.current!);
        const plainTextBlock = inputDiv.parents(".PlainTextBlock");

        const appOverlayZIndex = getAppOverlayZIndex();

        plainTextBlock.css({
            position: "fixed",
            zIndex: appOverlayZIndex + 1
        });

        plainTextBlock.animate({
            height: "80vh",
            top: "90px",
            width: "90vw"
        });
    }


    function deactivateFullScreenStyles(): void {

        const inputDiv = $(inputDivRef.current!);
        const plainTextBlock = inputDiv.parents(".PlainTextBlock");
        
        // move up just a little bit
        plainTextBlock.css({
            height: "unset",
            position: "relative",
            top: "30px",
        });
        
        // resize quickly
        plainTextBlock.css({
            width: "100%"
        });

        // animate to start pos
        plainTextBlock.animate(
            {
                top: 0,
            },
            300,
            "swing", 
            () => {
                // reset to initial styles
                plainTextBlock.css({
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
            <ContentEditableDiv 
                className="plainTextInput fullWidth" 
                spellCheck={false} 
                placeholder="Plain text..."
                ref={inputDivRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDownCapture={handleKeyDownCapture}
                onKeyUp={handleKeyUp}
            >
                {inputDivValue}
            </ContentEditableDiv>

            {/* Copy button */}
            <Button
                className="defaultBlockButton copyButton"
                disabled={parsing}
                title="Copy"
                onClick={handleCopyClick}
            >
                <i className="fa-solid fa-copy"></i>
                <i className="fa-solid fa-copy"></i>
            </Button>

            {/* Fullscreen */}
            <Button 
                className="fullScreenButton defaultBlockButton ms-2"
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