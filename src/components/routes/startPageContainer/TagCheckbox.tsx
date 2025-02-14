import React, { useContext, useEffect, useState } from "react";
import { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { TagEntity } from "../../../abstract/entites/TagEntity";
import HelperProps from "../../../abstract/HelperProps";
import "../../../assets/styles/TagCheckbox.scss";
import { AppContext } from "../../App";
import { AppFetchContext } from "../../AppFetchContextHolder";
import Checkbox from "../../helpers/Checkbox";
import { useHasComponentMounted } from './../../../hooks/useHasComponentMounted';


interface Props extends HelperProps {

    tagEntity: TagEntity
}


/**
 * @parent ```<StartPageSideBarTagList>```
 * @since 0.0.1
 */
export default function TagCheckbox({tagEntity, ...props}: Props) {

    const [isSelected, setIsSelected] = useState(false);

    const { notifyUrlQueryParamsChange } = useContext(AppContext);
    const { setNoteSearchTags, getNoteSearchTags, isLoggedIn } = useContext(AppFetchContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "TagCheckbox");

    const hasComponentMounted = useHasComponentMounted();


    useEffect(() => {
        setIsSelected(getNoteSearchTags().has(tagEntity.name))

    }, [notifyUrlQueryParamsChange]);


    useEffect(() => {
        if (hasComponentMounted && isLoggedIn)
            handleIsSelectedChange();

    }, [isSelected]);


    function handleIsSelectedChange(): void {

        // case: switched from not-checked to checked
        if (isSelected)
            addTagToUrlQueryParam();

        // case: switched from checked to not-checked
        else if (!isSelected)
            removeTagFromUrlQueryParam();
    }


    /**
     * Add if not exists in "tags=..." list.
     */
    function addTagToUrlQueryParam(): void {

        const noteSearchTags = getNoteSearchTags();

        if (!noteSearchTags.has(tagEntity.name))
            setNoteSearchTags(new Set([...noteSearchTags, tagEntity.name]));
    }


    function removeTagFromUrlQueryParam(): void {

        const selectedTagEntityNames = new Set(getNoteSearchTags());
        selectedTagEntityNames.delete(tagEntity.name);

        setNoteSearchTags(new Set([...selectedTagEntityNames]));
    }


    return (
        <Checkbox 
            id={id} 
            className={className}
            style={style}
            dontHideChildren
            isChecked={isSelected}
            setIsChecked={setIsSelected}
            _checked={{borderColor: "var(--accentColor)"}}
            {...otherProps}
        >
            {tagEntity.name}

            {children}
        </Checkbox>
    )
}