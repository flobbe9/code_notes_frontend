import React, { useContext, useRef, useState } from "react";
import "../assets/styles/TagInput.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import { isBlank, log } from "../helpers/utils";
import { Tag } from "../abstract/entites/Tag";
import { BlockContainerTagListContext } from "./block/BlockContainerTagList";


interface Props extends DefaultProps {

    initialTag: Tag,

    propsKey: string
}


/**
 * @since 0.0.1
 */
// TODO: implement max length 50
export default function TagInput({initialTag, propsKey, ...props}: Props) {

    const [tag, setTag] = useState(initialTag);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "TagInput");

    const inputRef = useRef(null);

    const { 
        getTagElementIndex, 
        addTagElement,
        addTag, 
        removeTagElement,
        removeTag, 
        getTagElementsLength, 
        getTagsLength,
        getNumBlankTagElements
    } = useContext(BlockContainerTagListContext);


    function handleKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "Enter") 
            handleEnterKey(event);
    }
    
    
    function handleEnterKey(event): void {

        $(inputRef.current!).trigger("blur")
    }


    function handleChange(event): void {

        tag.name = $(inputRef.current!).prop("value");
    }


    function handleBlur(event): void {

        const numBlankTags = getNumBlankTagElements();

        // case: tag is blank and other blank tags are present
        if (isTagValueBlank() && numBlankTags > 1)
            handleRemoveTag(event);

        // case: no blank tags
        if (!numBlankTags)
            addTagElement();

        handleNewTag();
    }


    /**
     * Add current tag to ```note.tags``` if not present and update ```tag``` state
     */
    function handleNewTag(): void {

        if (isContainedInNote() || isTagValueBlank())
            return;
        
        const tag = {name: getTagInputValue()};

        // add to note
        addTag(tag);

        // update state
        setTag(tag);
    }


    function handleRemoveTag(event): void {
        
        removeTag(getTagElementIndex(propsKey));

        removeTagElement(propsKey);
    }


    function getTagInputValue(): string {

        return $(inputRef.current!).prop("value");
    }


    function isTagValueBlank(): boolean {

        return isBlank(getTagInputValue());
    }


    function isLastTagElement(): boolean {

        return getTagElementIndex(propsKey) === getTagElementsLength() - 1;
    }


    /**
     * Indicates whether this tag input has an entry in ```note.tags```.
     * 
     * @returns true if this tag input's index does not exceed ```note.tags.length```
     */
    function isContainedInNote(): boolean {

        return getTagElementIndex(propsKey) !== getTagsLength();
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
                title={"Tag " + tag.name}
                spellCheck={false}
                defaultValue={tag.name}
                ref={inputRef}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onBlur={handleBlur}
            />

            {/* Delete tag button */}
            <Button 
                className="tagInputDeleteButton flexCenter hover" 
                title="Delete tag"
                rendered={!isLastTagElement()}
                onClick={handleRemoveTag}
            >
                <i className="fa-solid fa-xmark m-1"></i>
            </Button>

            {children}
        </Flex>
    )
}