import React, { forwardRef, Ref, useContext, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperDiv from "./HelperDiv";
import HelperProps from "../../abstract/HelperProps";
import HiddenInput from "./HiddenInput";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
export default forwardRef(function ContentEditableDiv(
    {
        disabled = false,
        onClick,
        onFocus,
        onBlur,
        rendered = true,
        title = "",
        _disabled = {
            cursor: "default",
            opacity: 0.5
        },
        _hover = {},
        _focus = {},
        ...props
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    const [isFocus, setIsFocus] = useState(false);
    
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "ContentEditableDiv");

    const componentRef = useRef(null);
    const hiddencomponentRef = useRef(null);
    
    useImperativeHandle(ref, () => componentRef.current!, []);


    function handleFocus(event): void {

        if (disabled) {
            preventFocus();
            return;
        }

        setIsFocus(true);

        if (onFocus)
            onFocus(event);
    }


    function handleBlur(event): void {

        if (disabled) 
            return;
        
        setIsFocus(false);

        if (onBlur)
            onBlur(event);
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
                onFocus={handleFocus}
                onBlur={handleBlur}
                _hover={_hover}
                {...otherProps}
            >
                {children}
            </HelperDiv>

            {/* for deviating the focus if disabled */}
            <HiddenInput type="radio" ref={hiddencomponentRef} tabIndex={-1} />
        </>
    )
})