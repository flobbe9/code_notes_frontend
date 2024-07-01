import React from "react";
import "../../assets/styles/PlainTextBlock.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function PlainTextBlock({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "PlainTextBlock");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <div>Plain text</div>
                
            {children}
        </div>
    )
}