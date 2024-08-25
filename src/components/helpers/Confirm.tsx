import React, { forwardRef, Ref } from "react";
import "../../assets/styles/Confirm.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "./Flex";
import Button from "./Button";


interface Props extends DefaultProps {

    /** Label for the "confirm" button. Default is "Yes" */
    confirmLabel?: string,
    /** Label for the "cancel" button. Default is "Cancel" */
    cancelLabel?: string,

    /** Assuming a "click" event */
    onConfirm?: (clickEvent) => void,
    /** Assuming a "click" event */
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

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Confirm");


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            {/* Heading */}
            <div className="confirmHeading mb-3">
                {heading}
            </div>

            {/* Message */}
            <div className="confirmMessage mb-5">
                {message}
            </div>

            {/* Footer */}
            <Flex className="confirmFooter" horizontalAlign="right">
                <Button className="cancelButton hover" onClick={onCancel}>
                    {cancelLabel}
                </Button>

                <Button className="confirmButton hover" onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </Flex>
                
            {children}
        </div>
    )
})