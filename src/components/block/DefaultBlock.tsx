import React from "react";
import "../../assets/styles/DefaultBlock.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";


interface Props extends DefaultProps {

}


/**
 * Parent component for any block component. Defines some default behaviour and styling for all blocks.
 *  
 * @since 0.0.1
 */
export default function DefaultBlock({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "DefaultBlock");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            {children}
        </div>
    )
}