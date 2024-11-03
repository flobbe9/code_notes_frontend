import $ from "jquery";
import React, { useContext, useEffect, useRef } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import "../../assets/styles/Popup.scss";
import { AppContext } from "../App";
import Button from "./Button";
import Flex from "./Flex";
import HelperDiv from "./HelperDiv";


interface Props extends DefaultProps {

}


/**
 * Passing all props to "popupContentContainer". Will be displayed upon setting the ```popupContent``` in "App.tsx"
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
        setIsPopupVisible,
        setPopupContent
    } = useContext(AppContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props);

    const fadeDuration = 200;

    const componentRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!isAppOverlayVisible)
            setIsPopupVisible(false);

    }, [isAppOverlayVisible]);


    useEffect(() => {
        if (isPopupVisible)
            showPopup()
        else
            hidePopup();

    }, [isPopupVisible]);


    function handleXButtonClick(event): void {

        setIsPopupVisible(false);
    }


    /**
     * Fade out popup and reset content
     */
    async function hidePopup(): Promise<void> {

        $(componentRef.current!).fadeOut(fadeDuration);
        setIsAppOverlayVisible(false);
        
        // wait for popup to be hidden
        await new Promise((res, rej) => {
            setTimeout(() => {
                res(setPopupContent(<></>));
            }, fadeDuration);   
        });
    }


    function showPopup(): void {

        const popup = $(componentRef.current!);

        popup.fadeIn(fadeDuration);
        setIsAppOverlayVisible(true);

        popup.trigger("focus");
    }


    function handleOuterClick(event): void {

        // immitate overlay click
        if (event.target.className.includes("hidePopup") && isAppOverlayHideOnClick)
            setIsAppOverlayVisible(false);
    }


    return (
        <HelperDiv
            id="Popup"
            className="Popup"
            ref={componentRef}
            tabIndex={0} 
            >
            <Flex 
                className="fullHeight hidePopup"
                horizontalAlign="center"
                verticalAlign="center"
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
                    <div className="popupContent">{popupContent}</div>

                    {children}
                </div>
            </Flex>
        </HelperDiv>
    )
}