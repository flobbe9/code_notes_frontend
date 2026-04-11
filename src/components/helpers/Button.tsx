import { forwardRef, MouseEvent, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ButtonProps } from "../../abstract/ButtonProps";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { isObjectFalsy } from "../../helpers/utils";


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
    
    useEffect(() => {
        if (onRender) 
            onRender();

    }, []);

    useEffect(() => {
        setIsDisabled(disabled);
        
    }, [disabled]);


    function handleMouseEnter(_event: MouseEvent): void {

        if (isDisabled)
            return;

        setIsHover(true);
    }


    function handleMouseLeave(_event: MouseEvent): void {

        if (isDisabled)
            return;

        setIsHover(false);
    }


    function handleMouseDown(event: MouseEvent): void {
        if (disabled)
            return;

        if (onMouseDown)
            onMouseDown(event);

        setIsMouseDown(true);
    }


    function handleMouseUp(_event: MouseEvent): void {
        if (disabled)
            return;

        setIsMouseDown(false);
    }


    /**
     * Execute both ```onClick``` and ```handleClickPromise``` if not ```undefined``` in this order.
     * 
     * @param event 
     */
    function handleClick(event: MouseEvent): void {
        if (disabled)
            return;

        if (onClick)
            onClick(event);

        if (onClickPromise)
            handleClickPromise(event);
    }


    async function handleClickPromise(event: MouseEvent): Promise<any> {
        if (disabled)
            return;

        // case: no function passed
        if (!onClickPromise)
            return;

        const currentWidth = getComputedStyle(componentRef.current!).getPropertyValue("width");
        const currentMinWidth = getComputedStyle(componentRef.current!).getPropertyValue("min-width");
        const currentHeight = getComputedStyle(componentRef.current!).getPropertyValue("height");
        const currentMinHeight = getComputedStyle(componentRef.current!).getPropertyValue("min-height");
        
        // make sure to maintain button dimensions while spinner is beeing displayed
        componentRef.current!.style.minWidth = currentWidth;
        componentRef.current!.style.minHeight = currentHeight;
        setIsDisabled(true);
        setIsAwaitingPromise(true);
        
        await onClickPromise(event);

        componentRef.current!.style.minWidth = currentMinWidth;
        componentRef.current!.style.minHeight = currentMinHeight;
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
