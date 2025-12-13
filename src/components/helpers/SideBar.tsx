import React, { forwardRef, ReactNode, Ref, useEffect, useImperativeHandle, useRef } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import { BLOCK_SETTINGS_ANIMATION_DURATION } from "../../helpers/constants";
import { animateAndCommit, getCssConstant } from "../../helpers/utils";
import Button from "../helpers/Button";
import Flex from "../helpers/Flex";


interface Props extends HelperProps {
    /** Default is the burger button icon */
    toggleIcon?: ReactNode
    isVisible: boolean,
    setIsVisible: (isVisible: boolean) => void
    /** Width the right slide content should be animated to. Needs to be numeric and needs to include the unit. Default is ```200px``` */
    maxWidth?: string
    /** Indicates whether the left slide part should have ```position: absolute```. Default is ```false``` */
    leftAbsolute?: boolean
}


/**
 * Generic side bar. ```children``` are rendered into the "right" content that can slide.
 * 
 * @since 1.0.0
 */
export default forwardRef(function SideBar(
    {
        isVisible,
        setIsVisible,
        toggleIcon,
        maxWidth = "200px",
        leftAbsolute = false,
        ...props
    }: Props, 
    ref: Ref<HTMLDivElement>
) {

    const componentName = "SideBar";
    const { className, children, ...otherProps } = getCleanDefaultProps(props, componentName, true);

    const componentRef = useRef(null);
    const rightRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        if (props.onRender)
            props.onRender();

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);


    useEffect(() => {
        if (isVisible) 
            slideOpen();
        else
            slideClose();

    }, [isVisible]);


    /**
     * Update the ```isVisible``` state to open, only use this in use effect
     */
    function slideOpen(): void {

        const tagFilterContainer = rightRef.current!;

        tagFilterContainer.style.display = "block";

        animateAndCommit(tagFilterContainer, 
            {
                width: maxWidth, 
                paddingRight: getCssConstant("sideBarPadding"),
                paddingLeft: getCssConstant("sideBarPadding"),
            },
            { 
                duration: BLOCK_SETTINGS_ANIMATION_DURATION,
                easing: "ease-out",
            }
        );
    }


    /**
     * Update the ```isVisible``` state to close, only use this in use effect
     */
    function slideClose(): void {

        const tagFilterContainer = rightRef.current!;

        animateAndCommit(
            tagFilterContainer,
            {
                width: 0, 
                paddingRight: 0,
                paddingLeft: 0
            },
            {
                duration: BLOCK_SETTINGS_ANIMATION_DURATION,
                easing: "ease-in"
            },
            () => tagFilterContainer.style.display = "none"
        );
    }


    function handleKeyDown(event: KeyboardEvent): void {

        const keyName = event.key;

        if (keyName === "Escape")
            setIsVisible(false);
    }


    return (
        <Flex 
            className={`${className} fullHeight ${leftAbsolute && 'leftAbsolute'}`}
            ref={componentRef}
            flexWrap="nowrap"
            {...otherProps}
        >
            {/* Fixed sidebar part*/}
            <div className={`${componentName}-left`}>
                <Button 
                    className={`${componentName}-left-toggleButton hover`} 
                    disabled={props.disabled}
                    onClick={() => setIsVisible(!isVisible)}
                    _disabled={props._disabled}
                    _focus={props._focus}
                >
                    {toggleIcon || <i className="fa-solid fa-bars fa-xl"></i>}
                </Button>
            </div>

            {/* Expandable sidebar part */}
            <div className={`${componentName}-right hidden`} ref={rightRef}>
                {children}
            </div>
        </Flex>
    )
})