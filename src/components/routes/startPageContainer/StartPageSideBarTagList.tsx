import React, { useContext, useEffect, useRef, useState } from "react";
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
    const { isUpdateSideBarTagList } = useContext(StartPageContainerContext);
    const { searchValue } = useContext(StartPageSideBarContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBarTagList", true);

    const componentRef = useRef(null);


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
        logDebug(selectedTagNames, tagEntities)

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
            .map(tagEntity => 
                getTagCheckboxElement(tagEntity));
    }


    function getTagCheckboxElement(tagEntity: TagEntity): JSX.Element {
        const isDisabled = disabled || !!editedNoteEntities.length;
        return <TagCheckbox 
            key={getRandomString()} 
            tagEntity={tagEntity} 
            disabled={isDisabled} 
            title={editedNoteEntities.length ? 'Please save your pending changes first.' : tagEntity.name}
        />;
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
