import React from "react";
import "../assets/styles/StartPageSideBarTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import TagCheckbox from "./TagCheckbox";


interface Props extends DefaultProps {

}


/**
 * Component for tags listed in ```<StartPageSideBar>```.
 * 
 * @since 0.0.1
 */
export default function StartPageSideBarTagList({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "StartPageSideBarTagList", true);

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <TagCheckbox>Docker</TagCheckbox>
            <TagCheckbox>Linux</TagCheckbox>
            <TagCheckbox>Shell</TagCheckbox>
            <TagCheckbox>Tag</TagCheckbox>
                
            {children}
        </div>
    )
}