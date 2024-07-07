import React from "react";
import "../../assets/styles/BlockContainerTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import ContentEditableDiv from "../helpers/ContentEditableDiv";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function BlockContainerTagList({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "BlockContainerTagList");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <ContentEditableDiv>
                Tags...
            </ContentEditableDiv>
                
            {children}
        </div>
    )
}