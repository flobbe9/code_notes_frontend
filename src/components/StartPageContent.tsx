import React from "react";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function StartPageContent({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "StartPageContent");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >

            <div>
                Start page content
            </div>
                
            {children}
        </div>
    )
}