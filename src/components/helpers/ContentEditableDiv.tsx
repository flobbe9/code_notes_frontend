import React, { ClipboardEvent, DragEvent, forwardRef, Fragment, KeyboardEvent, MouseEvent, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import "../../assets/styles/ContentEditableDiv.scss";
import { getCursorIndex, getCursorLineNum } from "../../helpers/projectUtils";
import { getClipboardText, includesIgnoreCase, isBlank, isEmpty, isEventKeyTakingUpSpace } from "../../helpers/utils";
import { AppContext } from "../App";
import HelperDiv from "./HelperDiv";
import HiddenInput from "./HiddenInput";


interface Props extends HelperProps {
    /** 
     * Default is "". Avoid replacing inner html when placeholder is present since this will result in 
     * losing focus on every second click.
     */
    placeholder?: string

    /** Setter for the current cursor position state that is maintained by this component. ```[cursorIndexOfCurrentLine, lineNumber]```, 0-based and 1-based */
    setCursorPos?: (cursorPos: [number, number]) => void
}


/**
 * @since 0.0.1
 */
export default forwardRef(function ContentEditableDiv(
    {
        disabled = false,
        setCursorPos: setCursorPosProps,
        onFocus,
        onBlur,
        onKeyUp,
        onKeyDownCapture,
        onPaste,
        onDrop,
        onMouseDown,
        onMouseUp,
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
    const [cursorPos, setCursorPos] = useState([0, 1]);
    
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "ContentEditableDiv");

    const { isControlKeyPressed } = useContext(AppContext);    

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


    function handleKeyDownCapture(event: KeyboardEvent): void {

        if (disabled)
            return;

        if (onKeyDownCapture)
            onKeyDownCapture(event);

        const keyName = event.key as string;

        // case: typed something that should remove placeholder
        if (isEventKeyTakingUpSpace(keyName) && isInputDivEmpty())
           removePlaceholderInput();
    }


    function handleKeyUp(event: KeyboardEvent): void {
        if (disabled)
            return;

        if (onKeyUp)
            onKeyUp(event);

        if (isInputDivEmpty(false))
            appendPlaceholderInputToInputDiv();

        if (!isControlKeyPressed(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]))
            updateCursorPosState();
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

        setTimeout(updateCursorPosState, 1); // wait for text to be pasted i guess
    }
    

    function handleMouseDown(event: MouseEvent): void {
        if (disabled)
            return;

        if (onMouseDown)
            onMouseDown(event);

        updateCursorPosState();
    }

    
    function handleMouseUp(event: MouseEvent): void {

        if (disabled)
            return;

        if (onMouseUp)
            onMouseUp(event);

        updateCursorPosState(true);
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
    async function handleCut(): Promise<void> {

        if (disabled)
            return;

        const innerText = componentRef.current!.innerText;
        const clipboardText = await getClipboardText();

        // case: cut all content
        if (innerText === clipboardText)
            appendPlaceholderInputToInputDiv();

        setTimeout(updateCursorPosState, 1); // wait for text to be cut i guess
    }

    /**
     * Get the current cursor position in this input. Dont update state if input is not selected.
     * 
     * Should one of the two position values be -1, that value wont be altered
     */
    function updateCursorPosState(dontUpdateLineNum = false): void {
        if (componentRef.current! !== document.activeElement)
            return;

        const documentSelection = document.getSelection();
        if (!documentSelection)
            return;

        let cursorIndex = getCursorIndex(componentRef.current!);
        let cursorLineNum = dontUpdateLineNum ? cursorPos[1] : getCursorLineNum(componentRef.current!);

        if (cursorIndex === -1)
            cursorIndex = cursorPos[0];

        if (cursorLineNum === -1)
            cursorLineNum = cursorPos[1];

        // dont update state if no changes, for efficiency
        if (cursorIndex === cursorPos[0] && cursorLineNum === cursorPos[1])
            return;

        setCursorPos([cursorIndex, cursorLineNum]);
        if (setCursorPosProps)
            setCursorPosProps([cursorIndex, cursorLineNum]);
    }

    return (
        <Fragment>
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
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                tabIndex={disabled ? -1 : props.tabIndex}
                _hover={_hover}
                {...otherProps}
            >
                {children}
            </HelperDiv>

            {/* for deviating the focus if disabled */}
            <HiddenInput type="radio" ref={hiddencomponentRef} tabIndex={-1} />
        </Fragment>
    )
})