import React, { useContext, useEffect, useRef } from "react";
import "../../assets/styles/Popup.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "./Flex";
import Button from "./Button";
import { AppContext } from "../App";


interface Props extends DefaultProps {

}


/**
 * Passing all props to "popupContentContainer".
 * 
 * @since 0.0.1
 */
export default function Popup({...props}: Props) {

    const {
        isAppOverlayVisible,
        setIsAppOverlayVisible,
        isAppOverlayHideOnClick,
        popupContent,
        isPopupVisible,
        setIsPopupVisible
    } = useContext(AppContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props);

    const fadeDuration = 200;

    const componentRef = useRef(null);


    useEffect(() => {
        // hide popup if overlay is hidden
        if (!isAppOverlayVisible)
            setIsPopupVisible(false);

    }, [isAppOverlayVisible]);


    useEffect(() => {
        // toggle popup
        isPopupVisible ? showPopup() : hidePopup();

    }, [isPopupVisible]);


    function handleXButtonClick(event): void {

        setIsPopupVisible(false);
    }


    function hidePopup(): void {

        $(componentRef.current!).fadeOut(fadeDuration);
        setIsAppOverlayVisible(false);
    }


    function showPopup(): void {

        const popup = $(componentRef.current!);

        popup.fadeIn(fadeDuration);
        setIsAppOverlayVisible(true);

        popup.trigger("focus");
    }


    function handleOuterClick(event): void {

        // immitate overlay click
        if (event.target.className.includes("Popup") && isAppOverlayHideOnClick)
            setIsAppOverlayVisible(false);
    }


    return (
        <Flex 
            id="Popup"
            className="Popup"
            horizontalAlign="center"
            verticalAlign="center"
            tabIndex={0}
            ref={componentRef}
            onClick={handleOuterClick}
        >
            <div 
                id={id} 
                className={className + " popupContentContainer"}
                style={style}
                {...otherProps}
            >
                {/* Header */}
                <Flex className="popupHeader" horizontalAlign="right" verticalAlign="start">
                    <Button
                        className="popupXButton"
                        onClick={handleXButtonClick}
                    >
                        <i className="fa-solid fa-xmark fa-lg hoverStrong"></i>
                    </Button>
                </Flex>

                {/* Body */}
                {popupContent}

                {children}
            </div>
        </Flex>
    )
}