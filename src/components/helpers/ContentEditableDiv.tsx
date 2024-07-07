import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperDiv from "./HelperDiv";
import HelperProps from "../../abstract/HelperProps";
import HiddenInput from "./HiddenInput";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
// TODO: supress content editable child warnings in console
export default forwardRef(function ContentEditableDiv(
    {
        disabled = false,
        onClick,
        rendered = true,
        title = "",
        _disabled = {
            cursor: "default",
            opacity: 0.5
        },
        _hover = {},
        _focus = {},
        ...otherProps
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    const [isFocus, setIsFocus] = useState(false);
    
    const { id, className, style, children, other } = getCleanDefaultProps(otherProps, "ContentEditableDiv");
    
    const componentRef = useRef(null);
    const hiddencomponentRef = useRef(null);
    
    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        addFocusEvent();

    }, []);


    useEffect(() => {
        removeFocusEvent();
        addFocusEvent();
        
    }, [disabled]);


    function addFocusEvent(): void {
        
        $(componentRef.current!).on("focus", handleFocus);
        $(componentRef.current!).on("focusout", handleFocusOut);
    }


    function removeFocusEvent(): void {

        $(componentRef.current!).off("focus", handleFocus);
        $(componentRef.current!).off("focusout", handleFocusOut);
    }


    function handleFocus(event): void {

        if (disabled) {
            preventFocus();
            return;
        }

        setIsFocus(true);
    }


    function handleFocusOut(event): void {

        if (disabled) 
            return;
        
        setIsFocus(false);
    }


    function preventFocus(): void {

        $(hiddencomponentRef.current!).trigger("focus")
    }


    return (
        <>
            <HelperDiv 
                id={id} 
                className={className}
                style={{
                    ...style,
                    ...(isFocus ? _focus : {}),
                    ...(disabled ? _disabled : {})
                }}
                ref={componentRef}
                contentEditable
                onClick={onClick}
                disabled={disabled}
                _hover={_hover}
                other={other}
            >
                {children}
            </HelperDiv>

            {/* for deviating the focus if disabled */}
            <HiddenInput type="radio" ref={hiddencomponentRef} />
        </>
    )
})