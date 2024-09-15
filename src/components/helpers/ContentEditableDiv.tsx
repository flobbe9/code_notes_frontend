import $ from "jquery";
import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import "../../assets/styles/ContentEditableDiv.scss";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperDiv from "./HelperDiv";
import HelperProps from "../../abstract/HelperProps";
import HiddenInput from "./HiddenInput";
import { getClipboardText, includesIgnoreCase, isBlank, isEmpty, isEventKeyTakingUpSpace, log } from "../../helpers/utils";


interface Props extends HelperProps {

    /** 
     * Default is "". Avoid replacing inner html when placeholder is present since this will result in 
     * losing focus on every second click.
     */
    placeholder?: string
}


/**
 * @since 0.0.1
 */
export default forwardRef(function ContentEditableDiv(
    {
        disabled = false,
        onFocus,
        onBlur,
        onKeyUp,
        onKeyDownCapture,
        onPaste,
        rendered = true,
        title = "",
        placeholder = "",
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


    useEffect(() => {
        if (isInputDivEmpty(false))
            appendPlaceholderInputToInputDiv();
    }, []);


    function handleFocus(event): void {

        if (disabled) {
            preventFocus();
            return;
        }

        setIsFocus(true);

        if (onFocus)
            onFocus(event);

        if (includesIgnoreCase(event.target.className, "placeholderInput"))
            $(componentRef.current!).trigger("focus");
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


    /**
     * @param withPlaceholder if ```true``` the placeholerInput must be present for the div input to be considered "empty". 
     *                        if ```false``` the placeholderInput cannot be present for the div input to be considered "empty". 
     *                        Default is ```true```
     * @returns ```true``` if input div has no text (or white space) and no html (except possibly the placeholder ```<input>```)
     */
    function isInputDivEmpty(withPlaceholder = true): boolean {

        const inputDiv = $(componentRef.current!);
        const innerText = inputDiv.text();
        const innerHtml = inputDiv.html();
        const inputDivChildren = inputDiv.children();
        const firstInputDivChild = inputDivChildren.first();

        const isInnerHtmlConsideredEmpty = !inputDivChildren.length || firstInputDivChild.is(".placeholderInput");

        // case: empty only without inner text and a placeholder input
        if (withPlaceholder)
            return isEmpty(innerText) && isInnerHtmlConsideredEmpty;

        // case: actually empty
        return isEmpty(innerText) && isEmpty(innerHtml);
    }


    function handleKeyDownCapture(event): void {

        if (disabled)
            return;

        if (onKeyDownCapture)
            onKeyDownCapture(event);

        const keyName = event.key as string;

        // case: typed something that should remove placeholder
        if (isEventKeyTakingUpSpace(keyName) && isInputDivEmpty())
           removePlaceholderInput();
    }


    function handleKeyUp(event): void {

        if (disabled)
            return;

        if (onKeyUp)
            onKeyUp(event);

        if (isInputDivEmpty(false))
            appendPlaceholderInputToInputDiv();
    }


    function handlePaste(event): void {

        if (disabled)
            return;

        if (onPaste)
            onPaste(event);

        if (isInputDivEmpty())
            removePlaceholderInput();
    }


    /**
     * Append a text input to input div with ```placeholder``` as placeholder. 
     */
    function appendPlaceholderInputToInputDiv(): void {

        // case: no placeholder
        if (isBlank(placeholder))
            return;

        const placeholderInput = document.createElement("textarea");
        placeholderInput.className = "placeholderInput";
        placeholderInput.placeholder = placeholder;

        $(componentRef.current!).html(placeholderInput);
    }


    function removePlaceholderInput(): void {

        $(componentRef.current!).html("");
    }


    /**
     * Works only if reading clipboard data is permitted.
     */
    async function handleCut(event: React.ClipboardEvent<any>): Promise<void> {

        if (disabled)
            return;

        const innerText = $(componentRef.current!).text();
        const clipboardText = await getClipboardText();

        // case: cut all content
        if (innerText === clipboardText)
            appendPlaceholderInputToInputDiv();
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
                disabled={disabled}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDownCapture={handleKeyDownCapture}
                onKeyUp={handleKeyUp}
                onCut={handleCut}
                onPaste={handlePaste}
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