import $ from "jquery";
import React, { useEffect, useRef } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import "../../assets/styles/Hr.scss";
import { isBlank } from "../../helpers/utils";
import Flex from "./Flex";
import HelperDiv from "./HelperDiv";


interface Props extends DefaultProps {

    textContainerBottom?: number | string,
    textContainerLeft?: number | string,
    textContainerRight?: number | string,
    textContainerTop?: number | string,

    /** Default is "center" */
    textContainerHorizontalPos?: "start" | "center" | "end",
    /** Default is "center" */
    textContainerVerticalPos?: "start" | "center" | "end"

    hrClassName?: string
}


/**
 * An ```<hr>``` tag with movable text. 
 * 
 * Text will only be opaque if the ```<Hr>``` parents background color does have either a completely
 * opaque background or a completely transparent one.
 * 
 * The bottom, left etc. props will always override the horizontal / vertical props.
 * 
 * @since 0.0.1
 */
export default function Hr({
    textContainerBottom,
    textContainerLeft,
    textContainerRight,
    textContainerTop,
    textContainerHorizontalPos = "center",
    textContainerVerticalPos = "center",
    hrClassName,
    ...props
}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Hr");

    const componentRef = useRef<HTMLDivElement>(null);
    const textContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        makeBackgroundNonTransparent();

    }, []);


    /**
     * Make child container opaque for it to cover the ```<hr>``` line.
     */
    function makeBackgroundNonTransparent(): void {

        const textContainer = $(textContainerRef.current!);
        const parentBackgroundColor = $(componentRef.current!).parent().css("backgroundColor");

        // case: parent background is completely opque
        if (isBlank(parentBackgroundColor) || !parentBackgroundColor.includes("rgba"))
            return;

        // case: parent background is completely transparent
        if (parentBackgroundColor.includes("0)"))
            textContainer.css("backgroundColor", "rgb(255, 255, 255)");
    }


    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            horizontalAlign={textContainerHorizontalPos}
            verticalAlign={textContainerVerticalPos}
            ref={componentRef}
            {...otherProps}
        >
            <hr className={hrClassName} />

            <HelperDiv 
                className="Hr-textContainer" 
                style={{
                    bottom: textContainerBottom,
                    left: textContainerLeft,
                    right: textContainerRight,
                    top: textContainerTop
                }}
                ref={textContainerRef}
            >
                {children}
            </HelperDiv>
        </Flex>
    )
}