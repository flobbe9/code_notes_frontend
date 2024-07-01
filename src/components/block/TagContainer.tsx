import React from "react";
import "../../assets/styles/TagContainer.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function TagContainer({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "TagContainer");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <div contentEditable>
                Tags...
            </div>
                
            {children}
        </div>
    )
}