import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/NoteTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperDiv from "../helpers/HelperDiv";
import TagInput from "../TagInput";
import Flex from "../helpers/Flex";
import { NoteEntity } from "../../abstract/entites/NoteEntity";
import { NoteContext } from "./Note";
import { getRandomString, isArrayFalsy, isBlank, log } from '../../helpers/utils';
import { TagEntity } from "../../abstract/entites/TagEntity";
import { AppContext } from "../App";


interface Props extends DefaultProps {

}


/**
 * "TagElement" is referred to as a ```<TagInput />```. "TagEntity" is referred to as a ```TagEntity```, e.g. inside ```note.tags```.
 * 
 * @since 0.0.1
 */
// TODO: tag list hover moves with scrollbar
// TODO: new noteInput container wont add new tags
export default function NoteTagList({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "NoteTagList");

    const [tagElements, setTagElements] = useState<JSX.Element[]>([]);

    const componentRef = useRef(null);

    const { appUserEntity } = useContext(AppContext);
    const { note } = useContext(NoteContext);

    const context = {
        getTagElementIndex,
        addTagElement,
        addTag,
        removeTagElement,
        removeTag,
        getNumBlankTagElements,
        tagElements,
        tags: note.tags
    }


    useEffect(() => {
        setTagElements(mapTagsToJsx());

    }, []);


    function mapTagsToJsx(): JSX.Element[] {

        // case: note has no tags
        if (!note.tags || !note.tags.length) 
            return [getNewTagElement()];

        const tagElements = note.tags.map(tag => {
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
     * @param tag to add to ```note.tags```
     */
    function addTag(tag: TagEntity): void {

        // add to note tags
        note.tags = [...note.tags, tag];

        if (!appUserEntity.tags)
            appUserEntity.tags = [];

        appUserEntity.tags.push(tag);
    }


    /**
     * @param name the tag name. Default is ""
     * @returns a ```<TagInput />``` with an empty tag name
     */
    function getNewTagElement(name = ""): JSX.Element {

        const key = getRandomString();    
        const defaultTag = {name: ""};

        return <TagInput initialTag={defaultTag} key={key} propsKey={key} />;
    }


    /**
     * Remove the ```<TagInput />``` with given ```key``` from ```tagElements``` state.
     * 
     * @param key of the tagInput to remove
     */
    function removeTagElement(key: string): void {

        const tagElementToRemoveIndex = getTagElementIndex(key);

        // case: no tag with this key
        if (tagElementToRemoveIndex === -1)
            return;

        // remove tag
        const tagsState = tagElements;
        tagsState.splice(tagElementToRemoveIndex, 1);

        // update state
        setTagElements([...tagsState]);
    }


    /**
     * Removes tag at given ```index``` from ```note.tags```.
     * 
     * @param index of the tag to remove
     */
    function removeTag(index: number): void {

        const tagToRemove = note.tags.splice(index, 1)[0];

        removeTagFromAppUserEntityEntity(tagToRemove);
    }


    function removeTagFromAppUserEntityEntity(tag: TagEntity): void {

        // case: falsy arg or appUserEntity has no tags or no notes anyway
        if (!tag || !appUserEntity.tags || !appUserEntity.notes)
            return;

        // case: tag is used somewhere else
        if (appUserEntity.isTagPresentInANote(tag))
            return;
                
        appUserEntity.removeTag(tag);
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
    removeTagElement: (key: string) => {},
    removeTag: (index: number) => {},
    getNumBlankTagElements: () => {return 1 as number},
    tagElements: [<></>],
    tags: [new TagEntity()]
})