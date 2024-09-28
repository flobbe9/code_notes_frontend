import React, { forwardRef, Ref, useContext } from "react";
import "../../assets/styles/Confirm.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "./Flex";
import Button from "./Button";
import { AppContext } from "../App";
import HelperDiv from "./HelperDiv";


interface Props extends DefaultProps {

    /** Label for the "confirm" button. Default is "Yes" */
    confirmLabel?: string,
    /** Label for the "cancel" button. Default is "Cancel" */
    cancelLabel?: string,

    /** Assuming a "click" event. Will always hide the popup */
    onConfirm?: (clickEvent) => void,
    /** Assuming a "click" event. Will always hide the popup */
    onCancel?: (clickEvent) => void,

    /** No default styles in here */
    heading?: string | JSX.Element | JSX.Element[],
    /** No default styles in here */
    message?: string | JSX.Element | JSX.Element[]
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
        onConfirm,
        onCancel,
        heading,
        message,
        ...props
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    const { setIsPopupVisible } = useContext(AppContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Confirm");


    function handleCancel(event): void {

        if (onCancel)
            onCancel(event);
            
        setIsPopupVisible(false);
    }


    function handleConfirm(event): void {

        if (onConfirm)
            onConfirm(event);
            
        setIsPopupVisible(false);

    }


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            {/* Heading */}
            <HelperDiv className="confirmHeading mb-3" rendered={!!heading}>
                {heading}
            </HelperDiv>

            {/* Message */}
            <div className="confirmMessage mb-5">
                {message}
            </div>

            {/* Footer */}
            <Flex className="confirmFooter" horizontalAlign="right">
                <Button className="cancelButton hover" onClick={handleCancel}>
                    {cancelLabel}
                </Button>

                <Button className="confirmButton hover" onClick={handleConfirm}>
                    {confirmLabel}
                </Button>
            </Flex>
                
            {children}
        </div>
    )
})