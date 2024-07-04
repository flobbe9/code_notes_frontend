import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { FlexDirection, FlexWrap, TextAlign } from "../../abstract/CSSTypes";
import HelperProps from "../../abstract/HelperProps";


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
        onClick,
        rendered = true,
        _hover = {},
        ...otherProps
    }: Props,
    ref: Ref<HTMLDivElement>) {

    
    const [isHover, setIsHover] = useState(false);
    
    const { id, className, style, children } = getCleanDefaultProps(otherProps);

    const componentRef = useRef(null)

    // make "ref" usable inside this component
    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {

        toggleIsHover();
    }, []);


    function toggleIsHover(): void {

        const component = $(componentRef.current!);

        component.on("mouseenter", () => setIsHover(true))
                 .on("mouseleave", () => setIsHover(false));
    }


    return (
        <div 
            id={id} 
            className={className}
            style={{
                ...style,
                alignItems: verticalAlign,
                display: "flex",
                flexDirection: flexDirection,
                flexWrap: flexWrap,
                justifyContent: horizontalAlign,
                ...(isHover ? _hover : {}),
            }}
            ref={componentRef}
            onClick={onClick}
            hidden={!rendered}
        >
            {children}
        </div>
    )
})