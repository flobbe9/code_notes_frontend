import React, { ClipboardEvent, DragEvent, forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import "../../assets/styles/ContentEditableDiv.scss";
import { getClipboardText, includesIgnoreCase, isBlank, isEmpty, isEventKeyTakingUpSpace } from "../../helpers/utils";
import HelperDiv from "./HelperDiv";
import HiddenInput from "./HiddenInput";


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
        onDrop,
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

    const componentRef = useRef<HTMLDivElement>(null);
    const hiddencomponentRef = useRef<HTMLInputElement>(null);
    
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
            componentRef.current!.focus();
    }


    function handleBlur(event): void {

        if (disabled) 
            return;

        setIsFocus(false);

        if (onBlur)
            onBlur(event);
    }


    function preventFocus(): void {

        hiddencomponentRef.current!.focus()
    }


    /**
     * @param withPlaceholder if ```true``` the placeholerInput must be present for the div input to be considered "empty". 
     *                        if ```false``` the placeholderInput cannot be present for the div input to be considered "empty". 
     *                        Default is ```true```
     * @returns ```true``` if input div has no text (or white space) and no html (except possibly the placeholder ```<input>```)
     */
    function isInputDivEmpty(withPlaceholder = true): boolean {

        const inputDiv = componentRef.current!;
        const innerText = inputDiv.innerText;
        const inputDivChildren = inputDiv.children;
        const firstInputDivChild = inputDivChildren.length ? inputDivChildren[0] : undefined;

        const isInnerHtmlConsideredEmpty = !inputDivChildren.length || !!firstInputDivChild?.matches(".placeholderInput");

        // case: empty only without inner text and a placeholder input
        if (withPlaceholder)
            return isEmpty(innerText) && isInnerHtmlConsideredEmpty;

        // case: actually empty
        return isEmpty(innerText) || innerText === "\n";
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


    function handlePaste(event: ClipboardEvent): void {

        if (disabled) {
            event.preventDefault();
            return;
        }

        if (onPaste)
            onPaste(event);

        if (isInputDivEmpty())
            removePlaceholderInput();
    }


    function handleDrop(event: DragEvent): void {

        if (disabled) {
            event.preventDefault();
            return;
        }

        if (onDrop)
            onDrop(event);
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

        componentRef.current!.innerHTML = "";
        componentRef.current!.append(placeholderInput);
    }


    function removePlaceholderInput(): void {

        componentRef.current!.innerHTML = "";
    }


    /**
     * Works only if reading clipboard data is permitted.
     */
    async function handleCut(event: ClipboardEvent): Promise<void> {

        if (disabled)
            return;

        const innerText = componentRef.current!.innerText;
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
                onDrop={handleDrop}
                tabIndex={disabled ? -1 : props.tabIndex}
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