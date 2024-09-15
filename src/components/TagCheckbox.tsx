import $ from "jquery";
import React, { useContext, useEffect, useState } from "react";
import "../assets/styles/TagCheckbox.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Checkbox from "./helpers/Checkbox";
import { log } from "../helpers/utils";
import { TagEntity } from "../abstract/entites/TagEntity";
import { StartPageContainerContext } from "./StartPageContainer";
import HelperProps from "../abstract/HelperProps";


interface Props extends HelperProps {

    tagEntity: TagEntity
}


/**
 * @parent ```<StartPageSideBarTagList>```
 * @since 0.0.1
 */
export default function TagCheckbox({tagEntity, ...props}: Props) {

    const [hasComponentMounted, setHasComponentMounted] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const { selectedTagEntityNames, setSelectedTagEntityNames } = useContext(StartPageContainerContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "TagCheckbox");


    useEffect(() => {
        setHasComponentMounted(true);

    }, []);


    useEffect(() => {
        setIsSelected(selectedTagEntityNames.has(tagEntity.name))

    }, [selectedTagEntityNames]);


    useEffect(() => {
        if (hasComponentMounted)
            onIsSelectedChange();

    }, [isSelected]);


    function onIsSelectedChange(): void {

        // case: switched from not-checked to checked
        if (isSelected && !selectedTagEntityNames.has(tagEntity.name))
            addTagToSelectedTagEntityNames();

        // case: switched from checked to not-checked
        else if (!isSelected && selectedTagEntityNames.has(tagEntity.name))
            removeTagFromSelectedEntities();
    }


    function addTagToSelectedTagEntityNames(): void {

        setSelectedTagEntityNames(new Set([tagEntity.name, ...selectedTagEntityNames]))
    }


    function removeTagFromSelectedEntities(): void {

        const newSelectedTagEntityNames = selectedTagEntityNames;
        newSelectedTagEntityNames.delete(tagEntity.name);

        setSelectedTagEntityNames(new Set(newSelectedTagEntityNames));
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