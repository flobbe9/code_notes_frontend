import React from "react";
import "../../assets/styles/PlainTextBlock.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import ContentEditableDiv from "../helpers/ContentEditableDiv";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function PlainTextBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "PlainTextBlock");

    // add <code> button (?)

    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            <ContentEditableDiv>
                Plain text...
            </ContentEditableDiv>
                
            {children}
        </div>
    )
}