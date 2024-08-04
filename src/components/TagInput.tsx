import React, { useRef } from "react";
import "../assets/styles/TagInput.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import { log } from "../helpers/utils";
import { Tag } from "../abstract/entites/Tag";


interface Props extends DefaultProps {

    // TODO: does optional make sense?
    tag?: Tag
}


/**
 * @since 0.0.1
 */
// TODO: implement max length 50
export default function TagInput({tag, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "TagInput");

    const inputRef = useRef(null);

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

        $(inputRef.current!).trigger("blur")
    }


    function handleChange(event): void {

        if (tag)
            tag.name = $(inputRef.current!).prop("value");
    }


    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            flexWrap="nowrap"
            {...otherProps}
        >
            <input 
                type="text" 
                className="tagInput"
                placeholder="Tag..."
                title="Tag"
                spellCheck={false}
                defaultValue={tag?.name || ""}
                ref={inputRef}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
            />

            <Button className="tagInputDeleteButton flexCenter hover" title="Delete tag">
                <i className="fa-solid fa-xmark m-1"></i>
            </Button>

            {children}
        </Flex>
    )
}