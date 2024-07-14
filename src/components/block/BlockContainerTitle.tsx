import React from "react";
import "../../assets/styles/BlockContainerTitle.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";


interface Props extends DefaultProps {

}


/**
 * Container component for what is referred to as "Note" for the user. Contains list of blocks, the block title,
 * the block tags etc. 
 * 
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
            <input 
                className="titleInput" 
                type="text" 
                title="Note title"
                placeholder="Note title..."
            />

            {children}
        </div>
    )
}