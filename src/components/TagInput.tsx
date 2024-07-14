import React, { useRef } from "react";
import "../assets/styles/TagInput.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import { log } from "../helpers/utils";
import HiddenInput from "./helpers/HiddenInput";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function TagInput({...otherProps}: Props) {

    const { id, className, style, children, other } = getCleanDefaultProps(otherProps, "TagInput");

    const inputRef = useRef(null);
    const hiddenInputRef = useRef(null);

            // input
                // on key down
                    // if was empty
                        // create new empty tag
                    // if value.length === 1 and is backspace or entf
                        // remove other empty tag

    function handleKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "Enter") 
            handleEnterKey(event);
    }
    
    
    function handleEnterKey(event): void {

        // unfocus
        $(hiddenInputRef.current!).trigger("focus");
    }

        
    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            flexWrap="nowrap"
            {...other}
        >
            {/* for shifting focus */}
            <HiddenInput type={"radio"} ref={hiddenInputRef} tabIndex={-1} />

            <input 
                type="text" 
                className="tagInput"
                placeholder="Tag..."
                onKeyDown={handleKeyDown}
                title="Tag"
                spellCheck={false}
                ref={inputRef}
            />

            <Button className="tagInputDeleteButton flexCenter hover" title="Delete tag">
                <i className="fa-solid fa-xmark m-1"></i>
            </Button>

            {children}
        </Flex>
    )
}