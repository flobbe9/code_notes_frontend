import $ from "jquery";
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
    setIsOverlayVisible: (isVisible: boolean) => void,

    /** Indicates whether the overlay should only cover the it's parent. Will only work if parent has a relative position. Default is ```true``` */
    fitParent?: boolean,

    /** The duration in millis that the overlay fades in. Default is 200 */
    fadeInDuration?: number,
    /** The duration in millis that the overlay fades out. Default is 200 */
    fadeOutDuration?: number
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
        fitParent = true,
        fadeInDuration = 200,
        fadeOutDuration = 200,
        onClick,
        onKeyDown,
        ...props
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Overlay");

    const componentRef = useRef(null);
    const backgroundRef = useRef(null);
    const childrenRef = useRef(null);


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
        const background = $(backgroundRef.current!);
        const children = $(childrenRef.current!);

        setIsOverlayVisible(false);

        // hide children
        children.animate(
            {
            opacity: 0
            },
            fadeOutDuration,
            "swing"
        )

        // hide background
        background.animate(
            {
                opacity: 0,
            },
            fadeOutDuration,
            "swing",
            // hide component
            () => overlay.hide()
        );

    }


    function showOverlay(): void {

        const overlay = $(componentRef.current!);
        const background = $(backgroundRef.current!);
        const children = $(childrenRef.current!);

        setIsOverlayVisible(true);

        // show component
        overlay.show();

        // show background
        background.animate(
            {
                opacity: 0.3
            },
            fadeInDuration
        );

        // show children
        children.animate(
            {
                opacity: 1
            },
            fadeInDuration
        )
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
            style={{
                ...style,
                position: fitParent ? "absolute" : "fixed"
            }}
            ref={componentRef}
            onClick={handleClick}
            {...otherProps}
        >
            <div className="overlayBackground" ref={backgroundRef}></div>
            <div className="overlayChildrenContainer" ref={childrenRef}>{children}</div>
        </HelperDiv>
    )
})