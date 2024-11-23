import $ from "jquery";
import React, { ReactNode, useContext, useEffect, useRef } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import "../../assets/styles/Popup.scss";
import { AppContext } from "../App";
import Button from "./Button";
import Flex from "./Flex";
import HelperDiv from "./HelperDiv";
import { useLocation } from "react-router-dom";
import { useHasComponentMounted } from "../../hooks/useHasComponentMounted";


interface Props extends DefaultProps {
    popupContent: React.ReactNode,
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

    const { hidePopup } = useContext(AppContext);

    const location = useLocation();

    const hasComponentMounted = useHasComponentMounted();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Popup");

    const fadeDuration = 200;

    const componentRef = useRef<HTMLDivElement>(null);
    const popupContainerRef = useRef<HTMLDivElement>(null);

    
    useEffect(() => {
        if (hasComponentMounted)
            hideThisPopup();
    }, [location]);


    useEffect(() => {
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

        $(componentRef.current!).fadeOut(fadeDuration);
        
        // wait for popup to be hidden
        await new Promise((res, rej) => {
            setTimeout(() => {
                res(setPopupContent(<></>));
            }, fadeDuration);   
        });
    }


    function showThisPopup(): void {

        const popup = $(componentRef.current!);

        popup.fadeIn(fadeDuration);

        popup.trigger("focus");
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
                    <div className="popupContent">{id}{popupContent}</div>

                    {children}
                </div>
            </Flex>
        </HelperDiv>
    )
}