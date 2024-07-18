import React, { useContext, useRef } from "react";
import "../../assets/styles/PlainTextBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import ContentEditableDiv from "../helpers/ContentEditableDiv";
import Flex from "../helpers/Flex";
import { getClipboardText, isBlank, log, setClipboardText } from "../../helpers/utils";
import sanitize from "sanitize-html";
import { DEFAULT_HTML_SANTIZER_OPTIONS } from "../../helpers/constants";
import { AppContext } from "../App";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function PlainTextBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "PlainTextBlock");

    const { isKeyPressed } = useContext(AppContext);

    const inputDivRef = useRef(null);


    function handleFocus(event): void {

        // convert <code> sequences to ```
        $(inputDivRef.current!).html(parseCodeHtmlToCodeText());
    }


    function handleBlur(event): void {

        // convert ``` sequences to <code>
        $(inputDivRef.current!).html(sanitize(parseCodeTextToCodeHtml(), DEFAULT_HTML_SANTIZER_OPTIONS));
    }


    /**
     * Parses inner text of inputDiv replacing with ```"``````"``` with ```<code></code>```. Will consider
     * unclosed code sequences.
     * 
     * Wont actually update the inputDiv's inner html.
     * 
     * @returns parsed inner html of inputDiv
     */
    function parseCodeTextToCodeHtml(): string {

        const inputDiv = $(inputDivRef.current!);
        const inputText = inputDiv.html();
        const inputTextArray = inputText.split("```");
    
        // case: too short to have code blocks or no code blocks at all
        if (inputText.length <= 6 || inputTextArray.length <= 2)
            return inputText;
    
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
    
        return inputHtmlString;
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

        const inputDiv = $(inputDivRef.current!);
        const keyName = event.key;

        // case: paste
        if ((isKeyPressed("Control") && keyName === "v")) 
            inputDiv.html(sanitizeChildAttributes());
    }
    
    
    /**
     * @param dirtyHtml string to sanitize. Default is ```inputDiv.html()```
     * @return sanitized inner html of inputDiv. Does not change the inputDivs's html
     */
    function sanitizeChildAttributes(dirtyHtml?: string): string {

        const inputDiv = $(inputDivRef.current!);

        const sanitizedInputDiv = sanitize(dirtyHtml || inputDiv.html(), {
            // remove all attributes
            allowedAttributes: {}
        });

        return sanitizedInputDiv;
    }


    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            verticalAlign="center"
            flexWrap="nowrap"
            {...otherProps}
        >
            <ContentEditableDiv 
                className="plainTextInput fullWidth" 
                spellCheck={false} 
                ref={inputDivRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                onKeyDownCapture={handleKeyDownCapture}
            >
                Plain text with some <code>code...</code>
            </ContentEditableDiv>

            {children}
        </Flex>
    )
}