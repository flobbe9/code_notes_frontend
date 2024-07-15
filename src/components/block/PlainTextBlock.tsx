import React, { useRef } from "react";
import "../../assets/styles/PlainTextBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import ContentEditableDiv from "../helpers/ContentEditableDiv";
import Flex from "../helpers/Flex";
import { log } from "../../helpers/utils";
import sanitize from "sanitize-html";
import { DEFAULT_HTML_SANTIZER_OPTIONS } from "../../helpers/constants";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function PlainTextBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "PlainTextBlock");

    const inputRef = useRef(null);


    function handleFocus(event): void {

        // convert <code> sequences to ```
        $(inputRef.current!).text(parseHtmlToPlainText());
    }


    function handleBlur(event): void {

        // convert ``` sequences to <code>
        $(inputRef.current!).html(sanitize(parsePlainText(), DEFAULT_HTML_SANTIZER_OPTIONS));
    }


    /**
     * Parses inner text of input replacing with ```"``````"``` with ```<code></code>```. Will consider
     * unclosed code sequences.
     * 
     * Wont actually update the input's inner html.
     * 
     * @returns parsed inner html of input
     */
    function parsePlainText(): string {

        const input = $(inputRef.current!);
        const inputText = input.text();
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
     * Parses inner html of input replacing ```<code></code>``` with ```"``````"```. 
     * 
     * Wont actually update the input's inner text.
     * 
     * @returns parsed inner text of input
     */
    function parseHtmlToPlainText(): string {

        const input = $(inputRef.current!);
        let inputHtml = input.html();

        let newInputText = inputHtml
        newInputText = newInputText.replaceAll("<code>", "```");
        newInputText = newInputText.replaceAll("</code>", "```");

        return newInputText;
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
                ref={inputRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
            >
                Plain text with some <code>code</code>
            </ContentEditableDiv>

            {children}
        </Flex>
    )
}