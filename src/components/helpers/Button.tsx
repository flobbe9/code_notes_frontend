import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ButtonProps } from "../../abstract/ButtonProps";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import "../../assets/styles/Button.scss";
import { isObjectFalsy } from "../../helpers/utils";
import { useInitialStyles } from "../../hooks/useInitialStyles";


interface Props extends ButtonProps {

}


/**
 * @since 0.0.1
 */
export default forwardRef(function Button({
        rendered = true,
        disabled = false,
        type,
        title = "",
        tabIndex,
        onRender,
        onClick,
        onMouseDown,
        onSubmit,
        onClickPromise,
        _hover = {},
        _click = {},
        _disabled = {},
        ...props
    }: Props, 
    ref: Ref<HTMLButtonElement>
) {

    const [isAwaitingPromise, setIsAwaitingPromise] = useState(false);
    const [isDisabled, setIsDisabled] = useState(disabled);
    const [isHover, setIsHover] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Button");

    const componentRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => componentRef.current!, []);

    
    // set min width for promise buttons
    useInitialStyles(componentRef.current, (onClickPromise ? [["min-width", "width"], ["min-height", "height"]] : []), 200);


    useEffect(() => {
        if (onRender) 
            onRender();

    }, []);


    useEffect(() => {
        setIsDisabled(disabled);
        
    }, [disabled]);


    function handleMouseEnter(event): void {

        if (isDisabled)
            return;

        setIsHover(true);
    }


    function handleMouseLeave(event): void {

        if (isDisabled)
            return;

        setIsHover(false);
    }


    function handleMouseDown(event): void {

        if (disabled)
            return;

        if (onMouseDown)
            onMouseDown(event);

        setIsMouseDown(true);
    }


    function handleMouseUp(event): void {

        if (disabled)
            return;

        setIsMouseDown(false);
    }


    /**
     * Execute both ```onClick``` and ```handleClickPromise``` if not ```undefined``` in this order.
     * 
     * @param event 
     */
    function handleClick(event): void {

        if (disabled)
            return;

        if (onClick)
            onClick(event);

        if (onClickPromise)
            handleClickPromise(event);
    }


    async function handleClickPromise(event): Promise<any> {

        if (disabled)
            return;

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
     * Indicates whether to use the default disabled style or not.
     * 
     * @returns ```true``` if ```isDisabled``` and ```_disabled``` style is falsy
     */
    function isDefaultDisabledStyle(): boolean {

        return isDisabled && isObjectFalsy(_disabled);
    }


    return (
        <button 
            id={id} 
            className={className + (isDefaultDisabledStyle() ? " disabledButton" : "") + " dontSelectText " + (!rendered && "hidden")}
            ref={componentRef}
            style={{
                ...style,
                ...(isHover && !disabled ? _hover : {}),
                ...(isMouseDown && !disabled ? _click : {}),
                ...(isDisabled ? _disabled : {})
            }}
            disabled={isDisabled}
            title={title}
            type={type}
            tabIndex={tabIndex}
            onClick={handleClick}
            onSubmit={onSubmit}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            {...otherProps}
        >
            {/* Content */}
            <span hidden={isAwaitingPromise} className="buttonContentContainer flexCenter">{children}</span>

            {/* Spinner */}
            <i className={"fa-solid fa-circle-notch" + (isAwaitingPromise && " rotating")} hidden={!isAwaitingPromise}></i>
        </button>
    )
})