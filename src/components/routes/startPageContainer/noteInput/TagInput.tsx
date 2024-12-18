import React, { ChangeEvent, FocusEvent, MouseEvent, useContext, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { TagEntity } from "../../../../abstract/entites/TagEntity";
import { AppUserService } from "../../../../abstract/services/AppUserService";
import { TagEntityService } from "../../../../abstract/services/TagEntityService";
import "../../../../assets/styles/TagInput.scss";
import { MAX_TAG_INPUT_VALUE_LENGTH } from "../../../../helpers/constants";
import { isBlank } from "../../../../helpers/utils";
import { AppContext } from "../../../App";
import { AppFetchContext } from "../../../AppFetchContextHolder";
import Button from "../../../helpers/Button";
import Flex from "../../../helpers/Flex";
import { StartPageContainerContext } from "../StartPageContainer";
import { NoteContext } from "./Note";
import { NoteTagListContext } from "./NoteTagList";


interface Props extends DefaultProps {

    initialTagEntity: TagEntity,

    propsKey: string
}


/**
 * @parent ```<NoteTagList>```
 * @since 0.0.1
 */
export default function TagInput({initialTagEntity, propsKey, ...props}: Props) {

    const [tagEntity, setTagEntity] = useState<TagEntity>(initialTagEntity);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "TagInput");

    const inputRef = useRef<HTMLInputElement>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const { toast } = useContext(AppContext);
    const { appUserEntity, noteEntities} = useContext(AppFetchContext);
    const { updateStartPageSideBarTagList } = useContext(StartPageContainerContext);
    const { noteEdited } = useContext(NoteContext);

    const { 
        getTagElementIndex, 
        addTag,
        addTagEntity, 
        removeTag,
        removeTagEntity, 
        getNumBlankTags,
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
        inputRef.current!.blur();
    }


    function handleChange(event: ChangeEvent): void {

        tagEntity.name = inputRef.current!.value;

        noteEdited();
    }


    /**
     * Mak sure only one empty tag input is present. Update sidebar tag list and ```appUserEntity.tags```.
     * 
     * @param event 
     */
    function handleBlur(event: FocusEvent): void {
        
        let numBlankTags = getNumBlankTags();
        
        if (isDuplicateTag(!numBlankTags)) {
            // clear tag input
            handleDuplicateTag();
            numBlankTags++;
        }

        const isTagBlank = isTagValueBlank();

        // case: cleared existing tag
        if (isTagBlank && numBlankTags > 1)
            handleRemoveTag();

        // case: updated existing tag
        else if (!isTagBlank && numBlankTags === 1)
            handleUpdateTag();

        // case: added new tag
        else
            handleNewTag(numBlankTags);

        AppUserService.removeUnusedTags(appUserEntity, noteEntities);

        updateStartPageSideBarTagList();
    }


    /**
     * Add new tag entity to appUserEntity if ```tagEntity``` does not exist yet.
     */
    function handleUpdateTag(): void {

        if (!TagEntityService.contains(appUserEntity.tags, tagEntity))
            AppUserService.addTagEntity(appUserEntity, TagEntityService.clone(tagEntity));
    }


    /**
     * Update ```appUserEntity.tags```, ```noteEntity.tags``` and ```tagEntity``` states. Focus new tag.
     * 
     * Don't do anything if this tag is not a new tag or is blank.
     */
    function handleNewTag(numBlankTags: number): void {

        if (isTagElementContainedInNoteEntity() || isTagValueBlank())
            return;
        
        const tagEntity = {name: getTagValue()};

        addTagEntity(tagEntity);
        if (!numBlankTags)
            addTag();

        setTagEntity(tagEntity);

        // focus new tag
        setTimeout(focusNextTagInput, 10);
    }


    function handleRemoveTag(event?: MouseEvent): void {
        
        const tagIndex = getTagElementIndex(propsKey);

        removeTagEntity(tagIndex);
        removeTag(tagIndex);

        if (event)
            updateStartPageSideBarTagList();

        noteEdited();
    }


    function focusNextTagInput(): void {

        componentRef.current!.nextElementSibling?.querySelector("input")?.focus();
    }


    function getTagValue(): string {

        return inputRef.current!.value;
    }


    function isTagValueBlank(): boolean {

        return isBlank(getTagValue());
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

        if (!tagElements?.length)
            return false;

        return getTagElementIndex(propsKey) < tagElements.length - 1;
    }


    /**
     * @param isNewTagElement indicates that the tag to be checked has not been added to ```noteTagEntities``` yet
     * @returns ```true``` the current tag value should not be added to / updated in ```noteTagEntities```
     */
    function isDuplicateTag(isNewTagElement: boolean): boolean {

        if (!noteTagEntities)
            return false;

        const tagElementValue = getTagValue();

        return noteTagEntities!.filter(tag => tag.name === tagElementValue).length === (isNewTagElement ? 1 : 2);
    }


    /**
     * Clear tag input value and toast warn about duplicate tag.
     */
    function handleDuplicateTag(): void {

        let tagValue = getTagValue();
        inputRef.current!.value = "";

        if (tagValue.length > 30)
            tagValue = tagValue.substring(0, 30) + "...";

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
                title={"Tag " + tagEntity.name}
                spellCheck={false}
                defaultValue={tagEntity.name}
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