import React, { forwardRef, Ref, useContext, useRef } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import "../../assets/styles/Confirm.scss";
import { AppContext } from "../App";
import Button from "./Button";
import Flex from "./Flex";
import HelperDiv from "./HelperDiv";
import { isBooleanFalsy } from "../../helpers/utils";


interface Props extends DefaultProps {

    /** Label for the "confirm" button. Default is "Yes" */
    confirmLabel?: string,
    /** Label for the "cancel" button. Default is "Cancel" */
    cancelLabel?: string,
    
    /** No default styles in here */
    heading?: string | JSX.Element | JSX.Element[],
    /** No default styles in here */
    message?: string | JSX.Element | JSX.Element[],

    /** If ```true```, hitting "Enter" will trigger the confirm button without any tabbing. Else, it will trigger the cancel button. Default is ```false``` */
    focusConfirmOnRender?: boolean,

    /** Assuming a "click" event. Will always hide the popup */
    onConfirm?: (clickEvent) => void,
    /** Assuming a "click" event. Will always hide the popup */
    onCancel?: (clickEvent) => void,
}


/**
 * Supposed to go inside the ```<Popup>``` as ```popupContent```.
 * 
 * @since 0.0.1
 */
export default forwardRef(function Confirm(
    {
        confirmLabel = "Yes",
        cancelLabel = "Cancel",
        heading,
        message,
        focusConfirmOnRender = false,
        onConfirm,
        onCancel,
        ...props
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    const { hidePopup } = useContext(AppContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Confirm");

    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);


    function handleCancel(event): void {

        if (onCancel)
            onCancel(event);
            
        hidePopup();
    }


    function handleConfirm(event): void {

        if (onConfirm)
            onConfirm(event);
            
        hidePopup();
    }


    function focusCancelButton(): void {

        if (!focusConfirmOnRender && !isBooleanFalsy(focusConfirmOnRender))
            setTimeout(() => {
                cancelButtonRef.current!.focus();
            }, 0); // somehow necessary, 0 is fine
    }


    function focusConfirmButton(): void {

        if (focusConfirmOnRender)
            setTimeout(() => {
                confirmButtonRef.current!.focus();
            }, 0); // somehow necessary, 0 is fine
    }


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            {/* Heading */}
            <HelperDiv className="Confirm-heading mb-3" rendered={!!heading}>
                {heading}
            </HelperDiv>

            {/* Message */}
            <div className="Confirm-message mb-5">
                {message}
            </div>

            <Flex className="Confirm-footer" horizontalAlign="right">
                {/* Cancel */}
                <Button 
                    className="Confirm-footer-cancelButton hover" 
                    ref={cancelButtonRef}
                    onRender={focusCancelButton}
                    onClick={handleCancel}
                >
                    {cancelLabel}
                </Button>

                {/* Confirm */}
                <Button 
                    className="Confirm-footer-confirmButton hover" 
                    ref={confirmButtonRef} 
                    onRender={focusConfirmButton}
                    onClick={handleConfirm}
                >
                    {confirmLabel}
                </Button>
            </Flex>
                
            {children}
        </div>
    )
})