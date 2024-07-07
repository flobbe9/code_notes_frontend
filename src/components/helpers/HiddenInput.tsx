import React, { forwardRef, HTMLInputTypeAttribute, Ref } from "react";
import "../../assets/styles/HiddenInput.scss";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";


interface Props extends HelperProps {

    type: HTMLInputTypeAttribute,
    /** Default is "" */
    name?: string,
    /** Default is ```true``` */
    readOnly?: boolean,
    /** Default is ```undefined``` */
    checked?: boolean
}


/**
 * Component with an ```<input />``` element that has ```opacity = 0```, ```z-index = -1``` and ```position = absolute```. 
 * 
 * @since 0.0.1
 */
export default forwardRef(function HiddenInput(
    {
        type,
        name = "",
        rendered = true,
        disabled = false,
        readOnly = true,
        checked,
        ...otherProps
    }: Props,
    ref: Ref<HTMLInputElement>
) {

    const { id, className, style, other } = getCleanDefaultProps(otherProps, "HiddenInput");

    return (
        <input 
            id={id} 
            className={className}
            style={style}
            type={type}
            ref={ref}
            hidden={!rendered}
            disabled={disabled}
            checked={checked}
            readOnly={readOnly}
            {...other}
        />
    )
})