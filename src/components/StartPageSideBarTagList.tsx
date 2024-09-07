import React, { useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/StartPageSideBarTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { AppContext } from "./App";
import { TagEntity } from "../abstract/entites/TagEntity";
import { getRandomString, includesIgnoreCaseTrim, isBlank, isBooleanFalsy, log } from "../helpers/utils";
import { StartPageContainerContext } from "./StartPageContainer";
import { StartPageSideBarContext } from "./StartPageSideBar";
import TagCheckbox from "./TagCheckbox";
import { matchStringsConsiderWhiteSpace } from "../helpers/searchUtils";
import HelperProps from "../abstract/HelperProps";
import HelperDiv from "./helpers/HelperDiv";


interface Props extends HelperProps {

}


/**
 * Component for tags listed in ```<StartPageSideBar>```.
 * 
 * @since 0.0.1
 */
export default function StartPageSideBarTagList({disabled, ...props}: Props) {

    const [tags, setTags] = useState<JSX.Element[]>([]);

    const { appUserEntity } = useContext(AppContext);
    const { updateSideBarStates } = useContext(StartPageContainerContext);
    const { searchValue } = useContext(StartPageSideBarContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBarTagList", true);

    const componentRef = useRef(null);


    useEffect(() => {
        updateTags();

    }, [updateSideBarStates]);


    useEffect(() =>  {
        handleSearch(searchValue);

    }, [searchValue])


    function handleSearch(searchValue: string): void {

        updateTags(filterTagsBySearchValue(searchValue));
    }


    function updateTags(tagEntities = appUserEntity.tags): void {

        if (!isBooleanFalsy(updateSideBarStates))
            setTags(mapTags(tagEntities));
    }


    function mapTags(tagEntities = appUserEntity.tags): JSX.Element[] {

        if (!tagEntities)
            return [];

        return tagEntities.map(tagEntity => 
            getTagCheckboxElement(tagEntity));
    }


    function getTagCheckboxElement(tagEntity: TagEntity): JSX.Element {

        return <TagCheckbox key={getRandomString()} tagEntity={tagEntity} disabled={disabled} />;
    }


    function filterTagsBySearchValue(searchValue: string): TagEntity[] {

        const allTagEntities = appUserEntity.tags || [];

        // case: no search value or no tags at all
        if (isBlank(searchValue) || !allTagEntities)
            return allTagEntities;
        
        // iterate all tags
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