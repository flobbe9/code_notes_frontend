import { forwardRef, KeyboardEvent, Ref, useEffect, useImperativeHandle, useRef } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import { animateAndCommit } from "../../helpers/utils";
import Flex from "./Flex";
import HelperDiv from "./HelperDiv";


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

    const componentRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);
    const childrenRef = useRef<HTMLDivElement>(null);


    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [hideOnEscape]);


    useEffect(() => {
        handleStateChange(isOverlayVisible);

    }, [isOverlayVisible]);


    function hideOverlay(): void {

        const overlay = componentRef.current!;
        const background = backgroundRef.current!;
        const children = childrenRef.current!;

        setIsOverlayVisible(false);

        // hide children
        children.style.opacity = "0";

        // hide background
        animateAndCommit(
            background,
            { opacity: 0},
            { duration: fadeOutDuration, easing: "ease-out" },
            () => overlay.style.display = "none"
        )
    }


    function showOverlay(): void {

        const overlay = componentRef.current!;
        const background = backgroundRef.current!;
        const children = childrenRef.current!;

        setIsOverlayVisible(true);

        overlay.style.display = "block";

        // show background
        animateAndCommit(
            background,
            { opacity: 0.5 },
            { duration: fadeInDuration }
        );

        // show children
        children.style.opacity = "1";
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


    function handleEscape(_event: KeyboardEvent): void {
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
            <Flex 
                className="overlayChildrenContainer" 
                flexDirection="column"
                horizontalAlign="center"
                verticalAlign="center"
                ref={childrenRef}
            >
                {children}
            </Flex>
        </HelperDiv>
    )
})
