import React, { useEffect, useRef, useState } from "react";
import "../../assets/styles/ButtonSlideLabel.scss"; 
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Button from "./Button";


interface Props extends DefaultProps {
    /** The text inside the button that will be slide toggled on hover */
    label: string
}


/**
 * ```<Button>``` component that slide toggles it's ```label``` on hover.
 * 
 * @since 0.0.1
 */
export default function ButtonSlideLabel({label, title, ...props}: Props) {

    const [initialBlockButtonLabelWidth, setInitialBlockButtonLabelWidth] = useState<string | number>();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "ButtonSlideLabel");

    const componentRef = useRef(null);


    useEffect(() => {

        setInitialBlockButtonLabelWidth(getBlockButtonLabelWidth());
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
                width: initialBlockButtonLabelWidth
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
                width: 0
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
            ref={componentRef}
            {...otherProps}
        >
            {children}

            <span className="addBlockButtonLabelContainer">
                <span className="addBlockButtonLabel">{label}</span>
            </span>
        </Button>
    )
}