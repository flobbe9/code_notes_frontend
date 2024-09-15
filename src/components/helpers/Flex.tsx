import $ from "jquery";
import React, { forwardRef, Ref } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { FlexDirection, FlexWrap, TextAlign } from "../../abstract/CSSTypes";
import HelperProps from "../../abstract/HelperProps";
import HelperDiv from "./HelperDiv";


interface Props extends HelperProps {

    /** Wont be set at all if ```undefined``` */
    horizontalAlign?: TextAlign,
    /** Wont be set at all if ```undefined``` */
    verticalAlign?: TextAlign,
    /** If true, dont set display to "flex". Default is false. */
    disableFlex?: boolean,
    /** Default is "row". See {@link FlexDirection} */
    flexDirection?: FlexDirection,
    /** Default is "wrap". See {@link FlexWrap} */
    flexWrap?: FlexWrap,
}


/**
 * Component that is basically a div with ```display: "flex"``` using the ```horizontalAlign``` prop for
 * ```justify-content``` and the ```verticalAlign``` prop for ```align-items```. 
 * 
 * See App.css for class names.
 * 
 * @since 0.0.1
 */
export default forwardRef(function(
    {
        horizontalAlign, 
        verticalAlign,
        disableFlex = false,
        flexDirection = "row",
        flexWrap = "wrap",
        rendered = true,
        _hover = {},
        ...props
    }: Props,
    ref: Ref<HTMLDivElement>) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props);


    return (
        <HelperDiv 
            id={id} 
            className={className}
            style={{
                ...style,
                alignItems: verticalAlign,
                display: "flex",
                flexDirection: flexDirection,
                flexWrap: flexWrap,
                justifyContent: horizontalAlign,
            }}
            ref={ref}
            hidden={!rendered}
            _hover={_hover}
            {...otherProps}
        >
            {children}
        </HelperDiv>
    )
})