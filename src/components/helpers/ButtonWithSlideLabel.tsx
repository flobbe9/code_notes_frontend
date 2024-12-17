import React, { forwardRef, MouseEvent, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import "../../assets/styles/ButtonWithSlideLabel.scss";
import { animateAndCommit, stopAnimations } from "../../helpers/utils";
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

    const [initialNoteInputButtonLabelWidth, setInitialNoteInputButtonLabelWidth] = useState<string>();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "ButtonWithSlideLabel");

    const componentRef = useRef<HTMLButtonElement>(null);


    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        // wait for adjacent elements to render as well
        setTimeout(
            () => setInitialNoteInputButtonLabelWidth(getNoteInputButtonLabelWidth()), 
            200
        );
        
    }, []);


    function handleMouseEnter(event: MouseEvent): void {

        // case: initial width not set yet
        if (!initialNoteInputButtonLabelWidth)
            return;

        const buttonLabelElement = (event.target as HTMLElement).querySelector(".addNoteInputButtonLabelContainer") as HTMLButtonElement;

        // case: not finished rendered yet (?)
        if (!buttonLabelElement)
            return;

        // prepare for animation
        buttonLabelElement.style.position = "relative";
        buttonLabelElement.style.width = "0";
        buttonLabelElement.style.zIndex = "0";

        stopAnimations(buttonLabelElement);

        // show button label
        animateAndCommit(
            buttonLabelElement,
            {
                opacity: 1,
                width: initialNoteInputButtonLabelWidth,
            },
            { duration: 300, easing: "ease-out" }
        );
    }


    function handleMouseLeave(event): void {

        const buttonLabelElement = event.target.querySelector(".addNoteInputButtonLabelContainer") as HTMLButtonElement;

        stopAnimations(buttonLabelElement);

        // hide button label
        animateAndCommit(
            buttonLabelElement,
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
                buttonLabelElement.style.position = "absolute";
                buttonLabelElement.style.zIndex = "-1";
                buttonLabelElement.style.width = initialNoteInputButtonLabelWidth || "";        
            }
        )
    }


    function getNoteInputButtonLabelWidth(): string {

        if (!componentRef.current)
            return "0";

        const buttonLabelElement = componentRef.current!.querySelector(".addNoteInputButtonLabelContainer") as HTMLButtonElement;
        return buttonLabelElement?.offsetWidth + "px";
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
                <span className={`${labelClassName} addNoteInputButtonLabel`}>{label}</span>
            </span>
        </Button>
    )
})