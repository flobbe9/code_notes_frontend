import React, { forwardRef, LegacyRef, MutableRefObject } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { isBlank } from "../../helpers/utils";
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
    onClick?: (event) => void
}


/**
 * Component that is basically a div with ```display: "flex"``` using the ```horizontalAlign``` prop for
 * ```justify-content``` and the ```verticalAlign``` prop for ```align-items```. 
 * 
 * See App.css for class names.
 * 
 * @since 0.0.1
 */
export default forwardRef(function({horizontalAlign, 
                                    verticalAlign,
                                    disableFlex = false,
                                    flexDirection = "row",
                                    flexWrap = "wrap",
                                    onClick,
                                    rendered = true,
                                    ...otherProps}: Props,
    ref: LegacyRef<HTMLDivElement>) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps);


    function getCssDisplay(): string {

        let display = "flex";

        if (disableFlex)
            display = "";

        // always call this last
        if (!rendered)
            display = "none";

        return display;
    }


    return (
        <div 
            id={id} 
            className={className}
            style={{
                ...style,
                alignItems: verticalAlign,
                display: getCssDisplay(),
                flexDirection: flexDirection,
                flexWrap: flexWrap,
                justifyContent: horizontalAlign,
            }}
            ref={ref}
            onClick={onClick}
            >
            {children}
        </div>
    )
})