import $ from "jquery";
import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import "../../assets/styles/ButtonWithSlideLabel.scss"; 
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Button from "./Button";
import HelperProps from "../../abstract/HelperProps";


interface Props extends HelperProps {
    /** The text inside the button that will be slide toggled on hover */
    label: string,

    onClickPromise?: (event?) => Promise<any>,
}


/**
 * ```<Button>``` component that slide toggles it's ```label``` on hover.
 * 
 * @since 0.0.1
 */
export default forwardRef(function ButtonWithSlideLabel(
    {label, title, onClickPromise, ...props}: Props,
    ref: Ref<HTMLElement>) {

    const [initialNoteInputButtonLabelWidth, setInitialNoteInputButtonLabelWidth] = useState<string | number>();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "ButtonWithSlideLabel");

    const componentRef = useRef(null);


    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        // wait for adjacent elements to render as well
        setTimeout(() => {
            setInitialNoteInputButtonLabelWidth(getNoteInputButtonLabelWidth());
        }, 200);
        
    }, []);


    function handleMouseEnter(event): void {

        const buttonLabelElement = $(event.target).find(".addNoteInputButtonLabelContainer");

        // prepare for animation
        buttonLabelElement.css("position", "relative");
        buttonLabelElement.css("width", "0");
        buttonLabelElement.css("zIndex", "1");

        buttonLabelElement.stop();

        // show button label
        buttonLabelElement.animate(
            {
                opacity: 1,
                width: initialNoteInputButtonLabelWidth,
            },
            300
        )
    }


    function handleMouseLeave(event): void {

        const buttonLabelElement = $(event.target).find(".addNoteInputButtonLabelContainer");

        buttonLabelElement.stop();

        // hide button label
        buttonLabelElement.animate(
            {
                opacity: 0,
                width: 0,
            },
            300,
            "easeOutSine",
            // reset label style
            () => {
                buttonLabelElement.css("position", "absolute");
                buttonLabelElement.css("zIndex", "-1");
                buttonLabelElement.css("width", initialNoteInputButtonLabelWidth || "");        
            }
        )
    }


    function getNoteInputButtonLabelWidth(): string | number | undefined {

        const buttonLabelElement = $(componentRef.current!).find(".addNoteInputButtonLabelContainer");
        return buttonLabelElement.outerWidth();
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
            {children}

            <span className="addNoteInputButtonLabelContainer">
                <span className="addNoteInputButtonLabel">{label}</span>
            </span>
        </Button>
    )
})