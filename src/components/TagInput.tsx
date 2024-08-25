import React, { useContext, useRef, useState } from "react";
import "../assets/styles/TagInput.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import { isBlank, isEventKeyTakingUpSpace, log } from "../helpers/utils";
import { TagEntity } from "../abstract/entites/TagEntity";
import { NoteTagListContext } from "./noteInput/NoteTagList";
import { NoteContext } from "./noteInput/Note";
import { AppContext } from "./App";
import { INVALID_INPUT_CLASS_NAME, MAX_TAG_INPUT_VALUE_LENGTH } from "../helpers/constants";


interface Props extends DefaultProps {

    initialTag: TagEntity,

    propsKey: string
}


/**
 * @since 0.0.1
 */
export default function TagInput({initialTag, propsKey, ...props}: Props) {

    const [tag, setTag] = useState(initialTag);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "TagInput");

    const inputRef = useRef(null);

    const { toast, isControlKeyPressed } = useContext(AppContext);
    const { noteEntity } = useContext(NoteContext);

    const { 
        getTagElementIndex, 
        addTagElement,
        addTag, 
        // removeTagElement,
        removeTag, 
        getNumBlankTagElements,
        tagElements,
        noteTagEntities
    } = useContext(NoteTagListContext);


    function handleKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "Enter") 
            handleEnterKey(event);

        else if (isEventKeyTakingUpSpace(keyName, false) && !isControlKeyPressed() && isTagValueTooLong(event))
            handleTagValueTooLong(event);
    }

    
    function handleEnterKey(event): void {

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
     * Add current tag to ```noteEntity.tags``` if not present and update ```tag``` state
     */
    function handleNewTag(): void {

        if (isTagElementContainedInNoteEntity() || isTagValueBlank())
            return;
        
        const tag = {name: getTagElementValue()};

        // add to note
        addTag(tag);

        // update state
        setTag(tag);
    }


    function handleRemoveTag(event): void {
        
        removeTag(getTagElementIndex(propsKey));
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


    /**
     * @param event the key down event (assuming that the key has not yet been added to the input value)
     * @returns ```true``` if the tag input's value is longer than {@link MAX_TAG_INPUT_VALUE_LENGTH}
     */
    function isTagValueTooLong(event): boolean {

        const tagInput = $(inputRef.current!);
        const tagInputValue = tagInput.prop("value") + event.key;

        return tagInputValue.length > MAX_TAG_INPUT_VALUE_LENGTH;
    }


    /**
     * Prevent given key event and toast warn about text length.
     * 
     * @param event the key event that triggered this method
     */
    function handleTagValueTooLong(event: Event): void {

        event.preventDefault();

        toggleTagInvalid();

        toast("Tag name too long", "A tag name cannot have more than " + MAX_TAG_INPUT_VALUE_LENGTH + " characters.", "warn", 7000);
    }


    /**
     * Add the {@link INVALID_INPUT_CLASS_NAME} class to this input for given ```duration```.
     * 
     * @param duration the time in ms to keep the {@link INVALID_INPUT_CLASS_NAME} class before removing it again
     */
    function toggleTagInvalid(duration = 300): void {

        // get element
        const tagInput = $(inputRef.current!);

        tagInput.addClass(INVALID_INPUT_CLASS_NAME);

        setTimeout(() => {
            tagInput.removeClass(INVALID_INPUT_CLASS_NAME);
        }, duration);
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