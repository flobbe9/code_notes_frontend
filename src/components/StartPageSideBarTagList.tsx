import React from "react";
import "../assets/styles/StartPageSideBarTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Checkbox from "./helpers/Checkbox";


interface Props extends DefaultProps {

}


/**
 * Component for tags listed in ```<StartPageSideBar>```.
 * 
 * @since 0.0.1
 */
export default function StartPageSideBarTagList({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "StartPageSideBarTagList", true);

    // TODO: add some kind of clear all button
    
    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <Checkbox 
                id={id} 
                className={className}
                style={style}
                dontHideChildren
                _checked={{borderColor: "var(--accentColor)"}}
            >
                Docker
            </Checkbox>

            <Checkbox 
                id={id} 
                className={className}
                style={style}
                dontHideChildren
                _checked={{borderColor: "var(--accentColor)"}}
            >
                Linux
            </Checkbox>                
            {children}
        </div>
    )
}