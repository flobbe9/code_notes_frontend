import React, { forwardRef, MouseEvent, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import "../../assets/styles/ButtonWithSlideLabel.scss";
import { animateAndCommit, getTextWidth } from "../../helpers/utils";
import Button from "./Button";


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
        
    }, []);


    function handleMouseEnter(event: MouseEvent): void {

        // case: initial width not set yet
        if (!initialNoteInputButtonLabelWidth)
            return;

        labelContainerRef.current!.style.position = "relative";
        labelContainerRef.current!.style.width = "0";
        labelContainerRef.current!.style.zIndex = "0";

        animateAndCommit(
            labelContainerRef.current!,
            {
                opacity: 1,
                width: initialNoteInputButtonLabelWidth,
            },
            { duration: 300, easing: "ease-out" }
        );
    }


    function handleMouseLeave(event): void {

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
                labelContainerRef.current!.style.position = "absolute";
                labelContainerRef.current!.style.zIndex = "-1";
                labelContainerRef.current!.style.width = initialNoteInputButtonLabelWidth || "";        
            }
        )
    }


    function getNoteInputButtonLabelWidth(): string {

        if (!componentRef.current)
            return "0";

        const labelWidth = getTextWidth(label, labelRef.current!.style.fontSize, labelRef.current!.style.fontFamily, labelRef.current!.style.fontWeight);
        const childrenWidth = childrenRef.current!.offsetWidth;

        return (labelWidth + childrenWidth) + "px";
    }
    

    return (
        <Button 
            id={id}
            className={className} 
            style={style}
            title={title}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClickPromise={onClickPromise}
            ref={componentRef}
            {...otherProps}
        >
            <span className={`${componentName}-children`} ref={childrenRef}>{children}</span>

            <span className={`${componentName}-labelContainer`} ref={labelContainerRef}>
                <span className={`${componentName}-labelContainer-label ${labelClassName}`} ref={labelRef}>{label}</span>
            </span>
        </Button>
    )
})