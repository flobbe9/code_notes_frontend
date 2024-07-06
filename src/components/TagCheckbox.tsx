import React from "react";
import "../assets/styles/TagCheckbox.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Checkbox from "./helpers/Checkbox";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function TagCheckbox({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "TagCheckbox");

    return (
        <Checkbox 
            id={id} 
            className={className}
            style={style}
            dontHideChildren
            _checked={{backgroundColor: "var(--accentColor)"}}
        >
            {children}
        </Checkbox>
    )
}