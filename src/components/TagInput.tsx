import React, { useContext, useRef, useState } from "react";
import "../assets/styles/TagInput.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import { isBlank, log } from "../helpers/utils";
import { Tag } from "../abstract/entites/Tag";
import { BlockContainerTagListContext } from "./block/BlockContainerTagList";
import { BlockContainerContext } from "./block/BlockContainer";
import { AppContext } from "./App";


interface Props extends DefaultProps {

    initialTag: Tag,

    propsKey: string
}


/**
 * @since 0.0.1
 */
export default function TagInput({initialTag, propsKey, ...props}: Props) {

    const [tag, setTag] = useState(initialTag);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "TagInput");

    const inputRef = useRef(null);

    const { toast } = useContext(AppContext);
    const { note } = useContext(BlockContainerContext);

    const { 
        getTagElementIndex, 
        addTagElement,
        addTag, 
        removeTagElement,
        removeTag, 
        getNumBlankTagElements,
        tagElements,
        tags
    } = useContext(BlockContainerTagListContext);


    function handleKeyDown(event): void {

        const keyName = event.key;

        // TODO: does not work if text is longer than input and first char is out of view
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

        // case: duplicate tag
        if (isDuplicateTagElement())
            handleDuplicateTag();

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
        
        const tag = {name: getTagElementValue()};

        // add to note
        addTag(tag);

        // update state
        setTag(tag);
    }


    function handleRemoveTag(event): void {
        
        removeTag(getTagElementIndex(propsKey));

        removeTagElement(propsKey);
    }


    function getTagElementValue(): string {

        return $(inputRef.current!).prop("value");
    }


    function isTagValueBlank(): boolean {

        return isBlank(getTagElementValue());
    }


    function isLastTagElement(): boolean {

        return getTagElementIndex(propsKey) === tagElements.length - 1;
    }


    /**
     * Indicates whether this tag input has an entry in ```note.tags```.
     * 
     * @returns true if this tag input's index does not exceed ```note.tags.length```
     */
    function isContainedInNote(): boolean {

        return getTagElementIndex(propsKey) !== note.tags.length;
    }


    function isDuplicateTagElement(): boolean {

        const tagElementValue = getTagElementValue();

        return !!tags.filter(tag => tag.name === tagElementValue).length && !isContainedInNote();
    }


    /**
     * Clear tag input value and toast warn about duplicate tag.
     */
    function handleDuplicateTag(): void {

        const tagValue = getTagElementValue();
        $(inputRef.current!).val("");

        toast("Duplicate Tag", "This note already has a tag with the name '" + tagValue + "'.", "warn", 7000);     
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