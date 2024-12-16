import React, { forwardRef, HTMLInputTypeAttribute, Ref } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import "../../assets/styles/HiddenInput.scss";


interface Props extends HelperProps {

    /** Default is "text" */
    type?: HTMLInputTypeAttribute,
    /** Default is "" */
    name?: string,
    /** Default is ```true``` */
    readOnly?: boolean,
    /** Default is ```undefined``` */
    checked?: boolean,
    /** Default undefined */
    tabIndex?: number
}


/**
 * Component with an ```<input />``` element that has ```opacity = 0```, ```z-index = -1``` and ```position = absolute```. 
 * 
 * @since 0.0.1
 */
export default forwardRef(function HiddenInput(
    {
        type = "text",
        name = "",
        rendered = true,
        disabled = false,
        readOnly = true,
        checked,
        tabIndex,
        ...props
    }: Props,
    ref: Ref<HTMLInputElement>
) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "HiddenInput");

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
            tabIndex={tabIndex}
            {...otherProps}
        />
    )
})