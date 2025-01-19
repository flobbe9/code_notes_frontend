import React, { forwardRef, ReactNode, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import "../../assets/styles/SideBar.scss";
import { BLOCK_SETTINGS_ANIMATION_DURATION } from "../../helpers/constants";
import { animateAndCommit, getCssConstant } from "../../helpers/utils";
import { AppContext } from "../App";
import Button from "../helpers/Button";
import Flex from "../helpers/Flex";


interface Props extends DefaultProps {
    /** Default is burger button icon */
    toggleIcon?: ReactNode
    isVisible: boolean,
    setIsVisible: (isVisible: boolean) => void
}
// reconsider default width

/**
 * Generic side bar. ```children``` are rendered into the "right" content that can slide.
 * 
 * @since latest
 */
export default forwardRef(function SideBar(
    {
        isVisible,
        setIsVisible,
        toggleIcon,
        ...props
    }: Props, 
    ref: Ref<HTMLDivElement>
) {

    const { isMobileWidth } = useContext(AppContext);

    const componentName = "SideBar";
    const { className, children, ...otherProps } = getCleanDefaultProps(props, componentName, true);

    const componentRef = useRef(null);
    const rightRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);


    useEffect(() => {
        if (isVisible) 
            slideClose();
        else
            slideOpen();

    }, [isVisible]);


    /**
     * Update the ```isVisible``` state to close, only use this in use effect
     */
    function slideClose(): void {

        const tagFilterContainer = rightRef.current!;

        tagFilterContainer.style.display = "block";

        animateAndCommit(tagFilterContainer, 
            {
                width: getMaxWidth(), 
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
     * Update the ```isVisible``` state to open, only use this in use effect
     */
    function slideOpen(): void {

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


    function getMaxWidth(): string {

        return isMobileWidth ? getCssConstant("sideBarWidthMobile") : getCssConstant("sideBarWidth");
    }


    function handleKeyDown(event: KeyboardEvent): void {

        const keyName = event.key;

        if (keyName === "Escape")
            setIsVisible(false);
    }


    return (
        <Flex 
            className={`${className} fullHeight`}
            ref={componentRef}
            flexWrap="nowrap"
            {...otherProps}
        >
            {/* Fixed sidebar part*/}
            <div className={`${componentName}-left`}>
                <Button className={`${componentName}-left-toggleButton hover`} onClick={() => setIsVisible(!isVisible)}>
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