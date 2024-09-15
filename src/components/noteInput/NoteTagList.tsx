import $ from "jquery";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/NoteTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperDiv from "../helpers/HelperDiv";
import TagInput from "../TagInput";
import Flex from "../helpers/Flex";
import { NoteContext } from "./Note";
import { getRandomString, isArrayFalsy, isBlank, log } from '../../helpers/utils';
import { TagEntity } from "../../abstract/entites/TagEntity";
import { AppContext } from "../App";
import { StartPageContainerContext } from "../StartPageContainer";


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

    const componentRef = useRef(null);

    const { appUserEntity } = useContext(AppContext);
    const { updateSideBar } = useContext(StartPageContainerContext);
    const { noteEntity } = useContext(NoteContext);

    const context = {
        getTagElementIndex,
        addTagElement,
        addTag,
        removeTag,
        getNumBlankTagElements,
        tagElements,
        noteTagEntities: noteEntity.tags
    }


    useEffect(() => {
        setTagElements(mapTagsToJsx());

    }, []);


    function mapTagsToJsx(): JSX.Element[] {

        // case: note has no tags
        if (!noteEntity.tags || !noteEntity.tags.length) 
            return [getNewTagElement()];

        const tagElements = noteEntity.tags.map(tag => {
            const key = getRandomString();    
            return <TagInput initialTag={tag} key={key} propsKey={key} />;
        });

        // add blank tag
        tagElements.push(getNewTagElement());

        return tagElements;
    }


    /**
     * Append a new ```<TagInput />``` with an empty name to ```tags``` state. Does not update ```appUserEntity```.
     */
    function addTagElement(): void {

        setTagElements([...tagElements, getNewTagElement()]);
    }


    /**
     * @param tagEntity to add to ```noteEntity.tags``` and ```appUserEntity.tags```
     */
    function addTag(tagEntity: TagEntity): void {

        if (!tagEntity)
            return;

        // add to appUser first
        appUserEntity.addTag(tagEntity);

        // add to noteEntity
        noteEntity.tags = [...(noteEntity.tags || []), tagEntity];

        // notify sidebar
        updateSideBar();
    }


    /**
     * @param name the tag name. Default is ""
     * @returns a ```<TagInput />``` with an empty tag name
     */
    function getNewTagElement(name = ""): JSX.Element {

        const key = getRandomString();    
        const defaultTag = {name: name};

        return <TagInput initialTag={defaultTag} key={key} propsKey={key} />;
    }


    /**
     * Remove the ```<TagInput />``` with given ```key``` from ```tagElements``` state.
     * 
     * @param key of the tagInput to remove
     */
    function removeTagElement(index: number): void {

        // case: no tag with this key
        if (index === -1)
            return;

        // remove tag
        const tagsState = tagElements;
        tagsState.splice(index, 1);

        // update state
        setTagElements([...tagsState]);
    }


    /**
     * Removes tag at given ```index``` from ```noteEntity.tags```.
     * 
     * @param index of the tag to remove
     */
    function removeTag(index: number): void {

        const tagToRemove = noteEntity.tags!.splice(index, 1)[0];

        removeTagFromAppUserEntityEntity(tagToRemove);

        removeTagElement(index);

        updateSideBar();
    }


    function removeTagFromAppUserEntityEntity(tagEntity: TagEntity): void {

        // case: falsy arg or appUserEntity has no tagEntities or no notes anyway
        if (!tagEntity || !appUserEntity.tags || !appUserEntity.notes)
            return;

        // case: tagEntity is used somewhere else
        if (appUserEntity.isTagEntityPresentInANote(tagEntity))
            return;
                
        appUserEntity.removeTagEntity(tagEntity);
    }
    

    /**
     * @param key of the ```<TagInput />``` to search
     * @returns the index of the ```<TagInput />``` in the ```tagElements``` state with given ```key``` or -1 if not found
     */
    function getTagElementIndex(key: string): number {

        // case: falsy arg
        if (isBlank(key))
            return -1;

        let tagToRemoveIndex = -1;

        tagElements.forEach((tag, i) => { 
            // case: found tag by key
            if (tag.key === key) {
                tagToRemoveIndex = i; 
                return;
            }
        });
        
        return tagToRemoveIndex;
    }


    function getNumBlankTagElements(): number {

        const renderedTagInputs = getTagInputElements();

        return Array.from(renderedTagInputs)
                    .filter(tagElement => isBlank((tagElement as HTMLInputElement).value))
                    .length;
    }


    /**
     * @returns jquery of all tag ```<input />``` elements inside this component
     */
    function getTagInputElements(): JQuery {

        return $(componentRef.current!).find(".TagInput input");
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
    getTagElementIndex: (tag: string) => {return -1 as number},
    addTagElement: () => {},
    addTag: (tag: TagEntity) => {},
    removeTag: (index: number) => {},
    getNumBlankTagElements: () => {return 1 as number},
    tagElements: [<></>],
    noteTagEntities: [new TagEntity()] as (TagEntity[] | null)
})