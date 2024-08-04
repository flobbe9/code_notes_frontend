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

    const [initialBlockButtonLabelWidth, setInitialBlockButtonLabelWidth] = useState<string | number>();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "ButtonWithSlideLabel");

    const componentRef = useRef(null);


    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {

        // wait for adjacent elements to render as well
        setTimeout(() => {
            setInitialBlockButtonLabelWidth(getBlockButtonLabelWidth());
        }, 200);
    }, []);


    function handleMouseEnter(event): void {

        const buttonLabelElement = $(event.target).find(".addBlockButtonLabelContainer");

        // prepare for animation
        buttonLabelElement.css("position", "relative");
        buttonLabelElement.css("width", "0");

        buttonLabelElement.stop();

        // show button label
        buttonLabelElement.animate(
            {
                opacity: 1,
                width: initialBlockButtonLabelWidth,
                zIndex: 0
            },
            300
        )
    }


    function handleMouseLeave(event): void {

        const buttonLabelElement = $(event.target).find(".addBlockButtonLabelContainer");

        buttonLabelElement.stop();

        // hide button label
        buttonLabelElement.animate(
            {
                opacity: 0,
                width: 0,
                zIndex: -1
            },
            300,
            "easeOutSine",
            // reset label style
            () => {
                buttonLabelElement.css("position", "absolute");
                buttonLabelElement.css("width", initialBlockButtonLabelWidth || "");        
            }
        )
    }


    function getBlockButtonLabelWidth(): string | number | undefined {

        const buttonLabelElement = $(componentRef.current!).find(".addBlockButtonLabelContainer");
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

            <span className="addBlockButtonLabelContainer">
                <span className="addBlockButtonLabel">{label}</span>
            </span>
        </Button>
    )
})