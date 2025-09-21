import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import "../../assets/styles/ButtonWithSlideLabel.scss";
import { animateAndCommit } from "../../helpers/utils";
import Button from "./Button";
import { getTextWidth } from "../../helpers/projectUtils";


interface Props extends HelperProps {
    /** The text inside the button that will be slide toggled on hover */
    label: string,
    labelClassName?: string,

    onClickPromise?: (event?) => Promise<any>,
}


/**
 * ```<Button>``` component that slide toggles it's ```label``` on hover.
 * 
 * @since 0.0.1
 */
export default forwardRef(function ButtonWithSlideLabel(
    {label, labelClassName, title, onClickPromise, ...props}: Props,
    ref: Ref<HTMLElement>
) {

    const componentName = "ButtonWithSlideLabel";

    const [initialNoteInputButtonLabelWidth, setInitialNoteInputButtonLabelWidth] = useState<string>();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, componentName);

    const componentRef = useRef<HTMLButtonElement>(null);
    const childrenRef = useRef<HTMLElement>(null);
    const labelContainerRef = useRef<HTMLSpanElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);


    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        setTimeout(() => setInitialNoteInputButtonLabelWidth(getNoteInputButtonLabelWidth()), 200); // wait for adjacent elements to render as well
        
    }, [label]);


    function slideExpand(): void {
        // case: initial width not set yet
        if (!initialNoteInputButtonLabelWidth)
            return;

        labelContainerRef.current!.style.position = "relative";
        labelContainerRef.current!.style.width = "0";
        labelContainerRef.current!.style.display = "block";

        animateAndCommit(
            labelContainerRef.current!,
            {
                opacity: 1,
                width: initialNoteInputButtonLabelWidth,
            },
            { duration: 300, easing: "ease-out" }
        );
    }


    function slideCollapse(): void {
        // case: called this method because the button was unrendered
        if (!labelContainerRef.current)
            return;

        animateAndCommit(
            labelContainerRef.current!,
            {
                opacity: 0,
                width: 0,
            },
            {
                duration: 300,
                easing: "ease-out"
            },
            // reset label style
            () => {
                // above check somehow does not cover this callback
                if (!labelContainerRef.current)
                    return;

                labelContainerRef.current!.style.position = "absolute";
                labelContainerRef.current!.style.display = "none";
                labelContainerRef.current!.style.width = initialNoteInputButtonLabelWidth || "";        
            }
        )
    }


    function getNoteInputButtonLabelWidth(): string {
        if (!componentRef.current)
            return "0";

        const labelWidth = getTextWidth(label, labelRef.current!.style.fontSize, labelRef.current!.style.fontFamily, labelRef.current!.style.fontWeight);

        return (labelWidth + 25) + "px"; // 25 is a guess and should technically be the labels margin-left, but needs 10px in addition for some reason
    }
    

    return (
        <Button 
            id={id}
            className={className} 
            style={style}
            title={title}
            onMouseEnter={slideExpand}
            onMouseLeave={slideCollapse}
            onFocus={slideExpand}
            onBlur={slideCollapse}
            onClickPromise={onClickPromise}
            ref={componentRef}
            {...otherProps}
        >
            <span className={`${componentName}-children`} ref={childrenRef}>{children}</span>

            <span className={`${componentName}-labelContainer textLeft`} ref={labelContainerRef}>
                <span className={`${componentName}-labelContainer-label ${labelClassName}`} ref={labelRef}>{label}</span>
            </span>
        </Button>
    )
})