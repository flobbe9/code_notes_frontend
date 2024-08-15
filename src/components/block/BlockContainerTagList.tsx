import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/BlockContainerTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperDiv from "../helpers/HelperDiv";
import TagInput from "../TagInput";
import Flex from "../helpers/Flex";
import { Note } from "../../abstract/entites/Note";
import { BlockContainerContext } from "./BlockContainer";
import { getRandomString, isArrayFalsy, isBlank, log } from './../../helpers/utils';
import { Tag } from "../../abstract/entites/Tag";
import { AppContext } from "../App";


interface Props extends DefaultProps {

}


/**
 * "TagElement" is referred to as a ```<TagInput />```. "Tag" is referred to as a ```Tag```, e.g. inside ```note.tags```.
 * 
 * @since 0.0.1
 */
// TODO: tag list hover moves with scrollbar
export default function BlockContainerTagList({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "BlockContainerTagList");

    const [tagElements, setTagElements] = useState<JSX.Element[]>([]);

    const componentRef = useRef(null);

    const { appUser } = useContext(AppContext);
    const { note } = useContext(BlockContainerContext);

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
     * Append a new ```<TagInput />``` with an empty name to ```tags``` state. Does not update ```appUser```.
     */
    function addTagElement(): void {

        setTagElements([...tagElements, getNewTagElement()]);
    }


    /**
     * @param tag to add to ```note.tags```
     */
    function addTag(tag: Tag): void {

        // add to note tags
        note.tags = [...note.tags, tag];

        if (!appUser.tags)
            appUser.tags = [];

        appUser.tags.push(tag);
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

        removeTagFromAppUser(tagToRemove);
    }


    function removeTagFromAppUser(tag: Tag): void {

        // case: falsy arg or appUser has no tags or no notes anyway
        if (!tag || !appUser.tags || !appUser.notes)
            return;

        // case: tag is used somewhere else
        if (appUser.isTagPresentInANote(tag))
            return;
                
        appUser.removeTag(tag);
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
        <BlockContainerTagListContext.Provider value={context}>
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
        </BlockContainerTagListContext.Provider>
    )
}


export const BlockContainerTagListContext = createContext({
    getTagElementIndex: (tag: string) => {return -1 as number},
    addTagElement: () => {},
    addTag: (tag: Tag) => {},
    removeTagElement: (key: string) => {},
    removeTag: (index: number) => {},
    getNumBlankTagElements: () => {return 1 as number},
    tagElements: [<></>],
    tags: [new Tag()]
})