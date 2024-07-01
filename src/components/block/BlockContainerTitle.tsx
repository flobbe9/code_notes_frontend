import React from "react";
import "../../assets/styles/BlockContainerTitle.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function BlockContainerTitle({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "BlockContainerTitle");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <input type="text" placeholder="Title..." />

            {children}
        </div>
    )
}