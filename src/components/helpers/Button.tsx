import React, { CSSProperties, useEffect, useRef, useState } from "react";
import "../../assets/styles/Button.css";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import { ButtonType } from "../../abstract/CSSTypes";
import { isObjectFalsy, log } from "../../helpers/utils";


interface Props extends HelperProps {

    /** Button type (e.g. "submit") */
    type?: ButtonType,
    /** Default is "" */
    title?: string,
    onSubmit?: (event?) => void,
    /** 
     * Button will be disabled and show "spinner" while awaiting the promise. 
     * Remember to set this button's color explicitly for the "spinner" to match children's color.
     */
    onClickPromise?: (event?) => Promise<any>,
    /** Styles on click */
    _click?: CSSProperties
}


/**
 * @since 0.0.1
 */
export default function Button({
    rendered = true,
    disabled = false,
    type,
    title = "",
    onClick,
    onSubmit,
    onClickPromise,
    _hover = {},
    _click = {},
    _disabled = {},
    ...otherProps
}: Props) {

    const [isAwaitingPromise, setIsAwaitingPromise] = useState(false);
    const [isDisabled, setIsDisabled] = useState(disabled);
    const [isHover, setIsHover] = useState(false);
    const [isClick, setIsClick] = useState(false);

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "Button");

    const componentRef = useRef(null);


    useEffect(() => {

        initMinWidth();

        toggleIsHover();
        toggleIsClick();

    }, []);


    useEffect(() => {
        
        setIsDisabled(disabled);
        
    }, [disabled]);


    /**
     * Set "min-width" to "width" for button to keep it's width if children's width changes.
     */
    function initMinWidth(): void {

        const component = $(componentRef.current!);
        const componentWidth = component.css("width") || "";

        component.css("minWidth", componentWidth);
    }


    function toggleIsHover(): void {

        if (isDisabled)
            return;

        const component = $(componentRef.current!);

        component
            .on("mouseenter", () => setIsHover(true))
            .on("mouseleave", () => setIsHover(false));
    }


    function toggleIsClick(): void {

        const component = $(componentRef.current!);

        component
            .on("mousedown", () => setIsClick(true))
            .on("mouseup", () => setIsClick(false));
    }


    /**
     * Execute both ```onClick``` and ```handleClickPromise``` if not ```undefined``` in this order.
     * 
     * @param event 
     */
    function handleClick(event): void {

        if (onClick)
            onClick(event);

        if (onClickPromise)
            handleClickPromise(event);
    }


    async function handleClickPromise(event): Promise<any> {

        // case: no function passed
        if (!onClickPromise)
            return;

        setIsDisabled(true);
        setIsAwaitingPromise(true);
        
        await onClickPromise(event);

        setIsAwaitingPromise(false);
        setIsDisabled(false);
    }


    /**
     * Indicates wether to use the default disabled style or not.
     * 
     * @returns ```true``` if ```disabled``` and ```_disabled``` style is falsy
     */
    function isDefaultDisabledStyle(): boolean {

        return disabled && isObjectFalsy(_disabled);
    }


    return (
        <button 
            id={id} 
            className={className + (isDefaultDisabledStyle() ? " disabledButton" : "")}
            ref={componentRef}
            style={{
                ...style,
                ...(isHover ? _hover : {}),
                ...(isClick ? _click : {}),
                ...(isDisabled ? _disabled : {})
            }}
            hidden={!rendered}
            disabled={isDisabled}
            type={type}
            onClick={handleClick}
            onSubmit={onSubmit}
        >
            {/* Content */}
            <span hidden={isAwaitingPromise}>{children}</span>

            {/* Spinner */}
            <i className={"fa-solid fa-circle-notch" + (isAwaitingPromise && " rotating")} hidden={!isAwaitingPromise}></i>
        </button>
    )
}