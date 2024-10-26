import React from "react";
import { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { IconProps } from "../../../abstract/IconProps";


interface Props extends IconProps {

    /** Default is ```true``` */
    rotating?: boolean,
}



/**
 * @since 0.0.1
 */
export default function SpinnerIcon({
    rotating = true,
    size = "1em",
    ...props
}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "SpinnerIcon");

    return (
        <i 
            id={id} 
            className={`
                ${className} fa-solid fa-circle-notch
                ${rotating && ' rotating'}`}
            style={{
                fontSize: size,
                ...style
            }}
            {...otherProps}
        >
            {children}
        </i>
    )
}