import $ from "jquery";
import React, { useContext, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { TagEntity } from "../abstract/entites/TagEntity";
import "../assets/styles/TagInput.scss";
import { MAX_TAG_INPUT_VALUE_LENGTH } from "../helpers/constants";
import { isBlank } from "../helpers/utils";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import { NoteContext } from "./noteInput/Note";
import { NoteTagListContext } from "./noteInput/NoteTagList";


interface Props extends DefaultProps {

    initialTag: TagEntity,

    propsKey: string
}


/**
 * @parent ```<NoteTagList>```
 * @since 0.0.1
 */
export default function TagInput({initialTag, propsKey, ...props}: Props) {

    const [tag, setTag] = useState(initialTag);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "TagInput");

    const inputRef = useRef(null);
    const componentRef = useRef(null);

    const { toast } = useContext(AppContext);
    const { noteEntities, appUserEntity } = useContext(AppFetchContext);
    const { noteEntity } = useContext(NoteContext);

    const { 
        getTagElementIndex, 
        addTagElement,
        addTag, 
        removeTag, 
        getNumBlankTagElements,
        tagElements,
        noteTagEntities
    } = useContext(NoteTagListContext);


    function handleKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "Enter") 
            handleEnterKey(event);
    }

    
    function handleEnterKey(event: React.KeyboardEvent<HTMLInputElement>): void {

        event.preventDefault();
        $(inputRef.current!).trigger("blur");
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
     * Add current tag to ```noteEntity.tags``` if not present and update ```tag``` state. Focusses new tag
     */
    function handleNewTag(): void {

        if (isTagElementContainedInNoteEntity() || isTagValueBlank())
            return;
        
        const tagEntity = {name: getTagElementValue()};

        // add to states
        addTag(tagEntity, noteEntities, appUserEntity);

        // update component state
        setTag(tagEntity);

        // focus new tag
        setTimeout(focusNextTagInput, 10);
    }


    function handleRemoveTag(event): void {
        
        removeTag(getTagElementIndex(propsKey));
    }


    function focusNextTagInput(): void {

        $(componentRef.current!).next().find("input").trigger("focus");
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
     * Indicates whether this tag input has an entry in ```noteEntity.tags```.
     * 
     * @returns true if this tag input's index does not exceed ```noteEntity.tags.length```
     */
    function isTagElementContainedInNoteEntity(): boolean {

        if (!noteEntity.tags)
            return false;

        return getTagElementIndex(propsKey) !== noteEntity.tags.length;
    }


    function isDuplicateTagElement(): boolean {

        if (!noteTagEntities)
            return false;

        const tagElementValue = getTagElementValue();

        return !!noteTagEntities!.filter(tag => tag.name === tagElementValue).length && 
               !isTagElementContainedInNoteEntity();
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
            ref={componentRef}
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
                maxLength={MAX_TAG_INPUT_VALUE_LENGTH}
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