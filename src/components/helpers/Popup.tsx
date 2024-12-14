import React, { ReactNode, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import "../../assets/styles/Popup.scss";
import { POPUP_FADE_DURATION } from "../../helpers/constants";
import { fadeIn, fadeOut } from "../../helpers/utils";
import { useHasComponentMounted } from "../../hooks/useHasComponentMounted";
import { AppContext } from "../App";
import Button from "./Button";
import Flex from "./Flex";
import HelperDiv from "./HelperDiv";


interface Props extends DefaultProps {
    popupContent: React.ReactNode | undefined,
    isPopupVisible: boolean,
    setPopupContent: (content: ReactNode) => void
}


/**
 * Passing all props to "popupContentContainer". Will be displayed upon setting the ```popupContent``` in "App.tsx"
 * 
 * @since 0.0.1
 */
export default function Popup({
    popupContent,
    isPopupVisible,
    setPopupContent,
    ...props
}: Props) {

    const { hidePopup, setIsAppOverlayVisible, setIsAppOverlayHideOnEscape } = useContext(AppContext);

    const location = useLocation();

    const hasComponentMounted = useHasComponentMounted();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Popup");

    const componentRef = useRef<HTMLDivElement>(null);
    const popupContainerRef = useRef<HTMLDivElement>(null);

    
    useEffect(() => {
        if (hasComponentMounted) {
            hideThisPopup();
            setIsAppOverlayVisible(false);
            setIsAppOverlayHideOnEscape(true);
        }
    }, [location]);


    useEffect(() => {
        if (popupContent)
            popupContainerRef.current!.scrollTo({top: 0})
    }, [popupContent]);


    useEffect(() => {
        if (isPopupVisible)
            showThisPopup();
        else
            hideThisPopup();

    }, [isPopupVisible]);


    function handleXButtonClick(event): void {

        hidePopup();
    }


    /**
     * Fade out popup and reset content
     */
    async function hideThisPopup(): Promise<void> {

        fadeOut(componentRef.current!, POPUP_FADE_DURATION);
        
        // wait for popup to be hidden
        await new Promise((res, rej) => {
            setTimeout(() => {
                res(setPopupContent(undefined));
            }, POPUP_FADE_DURATION);   
        });
    }


    function showThisPopup(): void {

        fadeIn(componentRef.current!, POPUP_FADE_DURATION);
        componentRef.current!.focus();
    }


    function handleOuterClick(event): void {

        if (!event.target.className.includes(`hidePopup${id}`)) 
            return;

        hidePopup();
    }


    return (
        <HelperDiv
            id={id} 
            className={className}
            style={style}
            ref={componentRef}
            tabIndex={0} 
            {...otherProps}
        >
            <Flex 
                className={`Popup-flexContainer fullHeight hidePopup${id}`}
                horizontalAlign="center"
                verticalAlign="center"
                onClick={handleOuterClick}
            >
                <div 
                    className={"popupContentContainer"}
                    ref={popupContainerRef}
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