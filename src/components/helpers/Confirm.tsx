import React, { forwardRef, Ref, useContext, useImperativeHandle, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { RememberMyChoiceKey, RememberMyChoiceValue } from "../../abstract/RememberMyChoice";
import "../../assets/styles/Confirm.scss";
import { isBooleanFalsy, logWarn } from "../../helpers/utils";
import { AppContext } from "../App";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Flex from "./Flex";
import HelperDiv from "./HelperDiv";
import { REMEMBER_MY_CHOICE_KEY_PREFIX } from "../../helpers/constants";


interface Props extends DefaultProps {

    /** Label for the "confirm" button. Default is "Yes" */
    confirmLabel?: string,
    /** Label for the "cancel" button. Default is "Cancel" */
    cancelLabel?: string,
    
    /** No default styles in here */
    heading?: string | JSX.Element | JSX.Element[],
    /** No default styles in here */
    message?: string | JSX.Element | JSX.Element[],

    /** Will render a checkbox and store confirm choice to localStorage. Not showing popup again is not handled here. Default is ```false``` */
    rememberMyChoice?: boolean,
    /** Default is "Remember my choice" */
    rememberMyChoiceLabel?: string,
    /** Required if ```rememberMyChoice``` is ```true``` */
    rememberMyChoiceKey?: RememberMyChoiceKey

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
        rememberMyChoice = false,
        rememberMyChoiceLabel = "Remember my choice",
        rememberMyChoiceKey,
        focusConfirmOnRender = false,
        onConfirm,
        onCancel,
        ...props
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    const [isRememberMyChoice, setIsRememberMyChoice] = useState(false);

    const { hidePopup } = useContext(AppContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Confirm");

    const componentRef = useRef<HTMLDivElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    
    useImperativeHandle(ref, () => componentRef.current!, []);


    function handleCancel(event): void {

        if (onCancel)
            onCancel(event);
            
        hidePopup();
    }


    function handleConfirm(event): void {

        if (onConfirm)
            onConfirm(event);

        updateChoice("confirm");

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


    function updateChoice(choice: RememberMyChoiceValue): void {

        // case: is not remember my choice
        if (!choice || !rememberMyChoice || !isRememberMyChoice)
            return;

        if (!rememberMyChoiceKey) {
            logWarn("Missing remember my choice key");
            return;
        }

        localStorage.setItem(`${REMEMBER_MY_CHOICE_KEY_PREFIX}${rememberMyChoiceKey}`, choice);
    }


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            ref={componentRef}
            {...otherProps}
        >
            {/* Heading */}
            <HelperDiv className="Confirm-heading mb-3 pe-4" rendered={!!heading}>
                {heading}
            </HelperDiv>

            {/* Message */}
            <div className="Confirm-message mb-5">
                {message}
            </div>

            <div className="Confirm-footer">
                <Flex className="mb-4 hover" verticalAlign="center" rendered={rememberMyChoice}>
                    {/* Remember my choice */}
                    <Checkbox 
                        className="Confirm-footer-rememberMyChoiceCheckbox me-2" 
                        isChecked={isRememberMyChoice}
                        setIsChecked={setIsRememberMyChoice}
                    /> 
                    <span 
                        className="Confirm-footer-rememberMyChoiceLabel dontSelectText"
                        onClick={() => setIsRememberMyChoice(!isRememberMyChoice)}
                    >
                        {rememberMyChoiceLabel}
                    </span>
                </Flex>

                <Flex horizontalAlign="right">
                    {/* Cancel */}
                    <Button 
                        className="Confirm-footer-cancelButton hoverStrong me-2" 
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
            </div>
                
            {children}
        </div>
    )
})