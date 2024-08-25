import React, { useContext, useEffect, useState } from "react";
import "../assets/styles/StartPageSideBarTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Checkbox from "./helpers/Checkbox";
import { AppContext } from "./App";
import { TagEntity } from "../abstract/entites/TagEntity";
import { getRandomString, isBooleanFalsy, log } from "../helpers/utils";
import { StartPageContainerContext } from "./StartPageContainer";


interface Props extends DefaultProps {

}


/**
 * Component for tags listed in ```<StartPageSideBar>```.
 * 
 * @since 0.0.1
 */
export default function StartPageSideBarTagList({...props}: Props) {

    const [tags, setTags] = useState<JSX.Element[]>([]);

    const { appUserEntity } = useContext(AppContext);
    const { updateSideBarStates } = useContext(StartPageContainerContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBarTagList", true);


    useEffect(() => {
        updateTags();

    }, [updateSideBarStates]);


    function updateTags(): void {

        if (!isBooleanFalsy(updateSideBarStates))
            setTags(mapTags());
    }


    function mapTags(): JSX.Element[] {

        if (!appUserEntity.tags)
            return [];

        return appUserEntity.tags.map(tagEntity => 
            getTag(tagEntity));
    }


    function getTag(tagEntity: TagEntity): JSX.Element {

        return (
            <Checkbox
                dontHideChildren
                key={getRandomString()}
                _checked={{borderColor: "var(--accentColor)"}}
            >
                {tagEntity.name}
            </Checkbox>
        );
    }

    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            {tags}
                           
            {children}
        </div>
    )
}