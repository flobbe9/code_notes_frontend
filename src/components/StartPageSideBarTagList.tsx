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
export default function StartPageSideBarTagList({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBarTagList", true);

    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
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