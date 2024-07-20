import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import "../../assets/styles/Overlay.scss";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import HelperDiv from "./HelperDiv";
import { log } from "../../helpers/utils";


interface Props extends HelperProps {

    /** Default is ```true``` */
    hideOnClick?: boolean,

    /** Default is ```false``` */
    hideOnEscape?: boolean,

    isOverlayVisible: boolean,
    setIsOverlayVisible: (isVisible: boolean) => void
}


/**
 * Is not rendered by default.
 * 
 * @since 0.0.1
 */
export default forwardRef(function Overlay(
    {
        hideOnClick = true,
        hideOnEscape = false,
        isOverlayVisible,
        setIsOverlayVisible,
        onClick,
        onKeyDown,
        ...props
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Overlay");

    const componentRef = useRef(null);
    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        $(window).on("keydown", handleKeyDown);

        return () => {
            $(window).off("keydown", handleKeyDown);
        }
    }, [hideOnEscape]);


    useEffect(() => {
        handleStateChange(isOverlayVisible);

    }, [isOverlayVisible]);


    function hideOverlay(): void {

        const overlay = $(componentRef.current!);

        setIsOverlayVisible(false);

        overlay.animate(
            {
                opacity: 0,
            },
            200,
            "swing",
            () => overlay.hide()
        );

    }


    function showOverlay(): void {

        const overlay = $(componentRef.current!);

        setIsOverlayVisible(true);

        overlay.show();

        overlay.animate({
            opacity: 0.3
        });
    }


    function handleStateChange(isOverlayVisible: boolean): void {

        if (isOverlayVisible)
            showOverlay();

        else
            hideOverlay();
    }


    function handleClick(event): void {

        if (hideOnClick)
            hideOverlay();

        if (onClick)
            onClick(event);
    }


    function handleKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "Escape")
            handleEscape(event);
    }


    function handleEscape(event): void {

        if (hideOnEscape)
            hideOverlay();
    }

    
    return (
        <HelperDiv
            id={id} 
            className={className}
            style={style}
            ref={componentRef}
            onClick={handleClick}
            {...otherProps}
        >
            {children}
        </HelperDiv>
    )
})