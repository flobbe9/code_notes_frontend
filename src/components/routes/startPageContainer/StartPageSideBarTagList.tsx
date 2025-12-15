import React, { KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { TagEntity } from "../../../abstract/entites/TagEntity";
import HelperProps from "../../../abstract/HelperProps";
import { matchStringsConsiderWhiteSpace } from "../../../helpers/searchUtils";
import { getRandomString, isBlank } from "../../../helpers/utils";
import { AppFetchContext } from "../../AppFetchContextProvider";
import HelperDiv from "../../helpers/HelperDiv";
import { StartPageContainerContext } from "./StartPageContainer";
import { StartPageSideBarContext } from "./StartPageSideBar";
import TagCheckbox from "./TagCheckbox";
import { logDebug } from "@/helpers/logUtils";
import { useClickOutside } from "@/hooks/useClickOutside";


interface Props extends HelperProps {

}


/**
 * Component for tags listed in ```<StartPageSideBar>```.
 * 
 * @since 0.0.1
 */
export default function StartPageSideBarTagList({disabled, ...props}: Props) {
    const [tags, setTags] = useState<JSX.Element[]>([]);

    const { appUserEntity, getNoteSearchTags, editedNoteEntities } = useContext(AppFetchContext);
    const { isUpdateSideBarTagList, setIsUpdateSideBarTagList } = useContext(StartPageContainerContext);
    const { searchValue } = useContext(StartPageSideBarContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBarTagList", true);

    const componentRef = useRef(null);

    useClickOutside(componentRef, () => {
        // trigger reorder tag checkboxes
        setIsUpdateSideBarTagList(prev => !prev);
    }, "click")

    useEffect(() => {
        updateTags();
    }, [appUserEntity, isUpdateSideBarTagList, editedNoteEntities]);

    useEffect(() =>  {
        handleSearch(searchValue);
    }, [searchValue])

    function handleSearch(searchValue: string): void {
        updateTags(filterTagsBySearchValue(searchValue));
    }

    function updateTags(tagEntities = appUserEntity?.tags): void {
        setTags(mapTags(tagEntities));
    }

    function mapTags(tagEntities = appUserEntity?.tags): JSX.Element[] {
        if (!tagEntities)
            return [];

        const selectedTagNames = getNoteSearchTags();

        return tagEntities
            .sort((t1, t2) => t1.name.localeCompare(t2.name)) // sort alphabetically asc
            .sort((t1, t2) => { // sort by isSelected asc
                if ((selectedTagNames.has(t1.name) && selectedTagNames.has(t2.name)) || 
                    (!selectedTagNames.has(t1.name) && !selectedTagNames.has(t2.name)))
                    return 0;

                if (selectedTagNames.has(t1.name))
                    return -1;

                return 1;
            })
            .map((tagEntity, i) => 
                getTagCheckboxElement(tagEntity, i));
    }

    function getTagCheckboxElement(tagEntity: TagEntity, index: number): JSX.Element {
        const isDisabled = disabled || !!editedNoteEntities.length;
        return <TagCheckbox 
            disabled={isDisabled}
            key={getRandomString()}
            tagEntity={tagEntity}
            tabIndex={index === 0 ? 0 : -1} // only allow tab focus for first checkbox
            title={editedNoteEntities.length ? 'Please save your pending changes first.' : tagEntity.name}
            onKeyDown={handleTagCheckboxKeyDown}
        />;
    }

    function handleTagCheckboxKeyDown(event: KeyboardEvent): void {
        const checkboxInputClassName = "Checkbox-input";
        let tagCheckboxToFocus: HTMLElement|null = null;
        
        if (event.key === "ArrowDown") {
            event.preventDefault();
            tagCheckboxToFocus = (event.target as HTMLElement).parentElement?.nextElementSibling as HTMLElement;
        }
            
        else if (event.key === "ArrowUp") {
            event.preventDefault();
            tagCheckboxToFocus = (event.target as HTMLElement).parentElement?.previousElementSibling as HTMLElement;
        }
        
        if (tagCheckboxToFocus)
            (tagCheckboxToFocus.querySelector(`.${checkboxInputClassName}`) as HTMLInputElement).focus();
    }

    function filterTagsBySearchValue(searchValue: string): TagEntity[] {
        const allTagEntities = appUserEntity?.tags || [];

        // case: no search value or no tags at all
        if (isBlank(searchValue) || !allTagEntities)
            return allTagEntities;
        
        return allTagEntities
            .filter(tagEntity =>
                matchStringsConsiderWhiteSpace(searchValue, tagEntity.name));
    }

    return (
        <HelperDiv    
            id={id} 
            className={className}
            style={style}
            ref={componentRef}
            {...otherProps}
        >
            {tags}
                           
            {children}
        </HelperDiv>
    )
}
