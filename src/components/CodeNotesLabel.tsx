import React from "react";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function CodeNotesLabel({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "CodeNotesLabel");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <span style={{fontFamily: "var(--codeFont)"}}>Code</span>
            <span style={{fontFamily: "noteFont"}}> Notes</span>
                
            {children}
        </div>
    )
}