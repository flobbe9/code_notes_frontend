import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { TagEntity } from "../../../../abstract/entites/TagEntity";
import { AppUserService } from "../../../../abstract/services/AppUserService";
import { TagEntityService } from "../../../../abstract/services/TagEntityService";
import "../../../../assets/styles/NoteTagList.scss";
import { getRandomString, isBlank } from '../../../../helpers/utils';
import { AppFetchContext } from "../../../AppFetchContextHolder";
import Flex from "../../../helpers/Flex";
import HelperDiv from "../../../helpers/HelperDiv";
import { NoteContext } from "./Note";
import TagInput from "./TagInput";


interface Props extends DefaultProps {
}


/**
 * "TagElement" is referred to as a ```<TagInput />```. "TagEntity" is referred to as a ```TagEntity```, e.g. inside ```note.tags```.
 * 
 * @since 0.0.1
 */
export default function NoteTagList({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "NoteTagList");

    const [tagElements, setTagElements] = useState<JSX.Element[]>([]);

    const componentRef = useRef<HTMLDivElement>(null);

    const { appUserEntity, noteEntities } = useContext(AppFetchContext);
    const { noteEntity } = useContext(NoteContext);

    const context = {
        getTagElementIndex,
        addTag,
        addTagEntity,
        removeTag,
        removeTagEntity,
        getNumBlankTags,
        tagElements,
        noteTagEntities: noteEntity.tags
    }


    useEffect(() => {
        setTagElements(mapTagsToJsx());

    }, [noteEntity]);


    function mapTagsToJsx(): JSX.Element[] {

        // case: note has no tags
        if (!noteEntity.tags || !noteEntity.tags.length) 
            return [getNewTagElement()];

        const tagElements = noteEntity.tags.map(tag => {
            const key = getRandomString();
            return <TagInput initialTagEntity={tag} key={key} propsKey={key} />;
        });

        // add blank tag
        tagElements.push(getNewTagElement());

        return tagElements;
    }


    /**
     * Append a new ```<TagInput />``` with an empty name to ```tags``` state. Does not update ```appUserEntity```.
     */
    function addTag(): void {

        setTagElements([...tagElements, getNewTagElement()]);
    }


    /**
     * @param tagEntity to add to ```noteEntity.tags``` and ```appUserEntity.tags```
     */
    function addTagEntity(tagEntity: TagEntity): void {

        if (!tagEntity)
            return;

        // add to appUser first
        AppUserService.addTagEntity(appUserEntity, TagEntityService.clone(tagEntity));

        // add to noteEntity
        noteEntity.tags = [...(noteEntity.tags || []), tagEntity];
    }


    /**
     * Removes tag at given ```index``` from ```noteEntity.tags```.
     * 
     * @param index of the tag to remove
     */
    function removeTagEntity(index: number): void {

        const tagToRemove = noteEntity.tags!.splice(index, 1)[0];

        if (!tagToRemove || !appUserEntity.tags)
            return;

        // case: tagEntity is used somewhere else
        if (AppUserService.isTagEntityPresentInANote(noteEntities, tagToRemove))
            return;
                
        AppUserService.removeTagEntity(appUserEntity, tagToRemove);
    }


    /**
     * Remove the ```<TagInput />``` with given ```key``` from ```tagElements``` state.
     * 
     * @param key of the tagInput to remove
     */
    function removeTag(index: number): void {

        // case: no tag with this key
        if (index === -1)
            return;

        tagElements.splice(index, 1);
        setTagElements([...tagElements]);
    }
    

    /**
     * @param index
     * @param name the tag name. Default is ""
     * @returns a ```<TagInput />``` with an empty tag name
     */
    function getNewTagElement(name = ""): JSX.Element {

        const defaultTag = {name: name};

        const key = getRandomString();
        return <TagInput initialTagEntity={defaultTag} key={key} propsKey={key} />;
    }


    /**
     * @param key of the ```<TagInput />``` to search
     * @returns the index of the ```<TagInput />``` in the ```tagElements``` state with given ```key``` or -1 if not found
     */
    function getTagElementIndex(key: string | number): number {

        let tagElementIndex = -1;

        tagElements.forEach((tag, i) => { 
            // case: found tag by key
            if (tag.key === key) {
                tagElementIndex = i; 
                return;
            }
        });
        
        return tagElementIndex;
    }


    function getNumBlankTags(): number {

        const renderedTagInputs = getTagInputElements();

        return Array.from(renderedTagInputs)
                    .filter(tagElement => isBlank((tagElement as HTMLInputElement).value))
                    .length;
    }


    /**
     * @returns list of all tag ```<input />``` elements inside this component
     */
    function getTagInputElements(): NodeList {

        return componentRef.current!.querySelectorAll(".TagInput input");
    }


    return (
        <NoteTagListContext.Provider value={context}>
            <HelperDiv
                id={id} 
                className={className}
                style={style}
                ref={componentRef}
                {...otherProps}
                >
                <Flex className="tagInputContainer fullHeight" flexWrap="nowrap">
                    {tagElements}
                </Flex>

                {children}
            </HelperDiv>
        </NoteTagListContext.Provider>
    )
}


export const NoteTagListContext = createContext({
    getTagElementIndex: (key: string | number) => {return -1 as number},
    addTag: () => {},
    addTagEntity: (tag: TagEntity) => {},
    removeTag: (index: number) => {},
    removeTagEntity: (index: number) => {},
    getNumBlankTags: () => {return 1 as number},
    tagElements: [<></>],
    noteTagEntities: [{}] as (TagEntity[] | null)
})