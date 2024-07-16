import React, { useEffect, useRef, useState } from "react";
import "../../assets/styles/CodeBlockWithVariables.scss";
import 'highlight.js/styles/github.css';
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import ContentEditableDiv from "../helpers/ContentEditableDiv";
import hljs from "highlight.js";
import Sanitized from "../helpers/Sanitized";
import { log } from "../../helpers/utils";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function CodeBlockWithVariables({...props}: Props) {

    const [highlightedInputValue, setHighlightedInputValue] = useState("");
    const [inputText, setInputText] = useState("");

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "CodeBlockWithVariables");
    
    const inputRef = useRef(null);

    useEffect(() => {

    }, [highlightedInputValue])

    // TODO: 
        // full size mode
        // buttons
        // hightlighting
        // inputs
        // mark focused line like in vscode (?)
    
    function handleKeyDown(event): void {

        const keyName = (event.key as string);

        // else if is enter 
            // if is exceed view height
                // prevent default

        // else if is backspace
            // delete last char from text
            // prevent default
    }


    // on focus out
        // highlight
            // get inner text
            // highlight
            // parse
            // replace inner text
        // convert vars to inputs

    // replace vars with inputs
        // find $[[]] in inner text
        // save start index
        // get value inside
        // remove from inner text
        // add input with value to inner html pos
        


    return (
        <Flex 
            id={id} 
            className={className + " fullWidth"}
            style={style}
            flexWrap="nowrap"
            {...otherProps}
        >
            <ContentEditableDiv className="fullWidth codeInput" ref={inputRef} spellCheck={false} onKeyDown={handleKeyDown} /> 

            <Flex horizontalAlign="right">
                <Button className="addVariableButton defaultBlockButton hover flexCenter" title="Add variable">
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-dollar-sign"></i>
                </Button>
            </Flex>
                
            {children}
        </Flex>
    )
}