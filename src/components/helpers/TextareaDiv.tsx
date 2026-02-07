import DefaultProps, { getCleanDefaultProps } from "@/abstract/DefaultProps";
import { logDebug, logError } from "@/helpers/logUtils";
import { countTextareaLines } from "@/helpers/projectUtils";
import React, { ChangeEvent, FocusEvent, forwardRef, Fragment, MouseEvent, Ref, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import Sanitized from "./Sanitized";
import Overlay from "./Overlay";
import SpinnerIcon from "./icons/SpinnerIcon";

export type TextareaDivMode = "textarea" | "div";

interface Props extends Omit<DefaultProps, "children"> {
    /**
     * Called upon switching from textarea to div. Throwing an error will log to console and
     * not switch the mode.
     * 
     * @param textareaValue `value` of the textarea element
     * @returns the innerHtml for the div
     */
    parseDiv: (textareaValue: string, textarea: HTMLTextAreaElement) => Promise<string>,

    /**
     * Called upon switching from div to textarea. Throwing an error will log to console and
     * not switch the mode.
     * 
     * @param divInnerHtml innerHtml of the div element
     * @returns the `value` for the textarea
     */
    parseTextarea: (divInnerHtml: string, div: HTMLDivElement) => Promise<string>,

    /**
     * Initial mode. Should match `defaultValue` content type.
     * 
     * Default is "div".
     */
    defaultMode?: TextareaDivMode,

    /**
     * Initial content of the div / textarea. Should match `defaultMode`.
     * 
     * Default is "".
     */
    defaultValue?: string,
    
    /**
     * State setter for keeping track of the current content. Will either set the div's innerHTML or the textarea's value.
     */
    setValue?: (value: string) => void,

    /**
     * State setter for keeping track of the current mode. 
     */
    setMode?: (mode: TextareaDivMode) => void
}

/**
 * Will render a `<textarea>` element while focused and a `<div>` element while unfocused. Will display a pending indicator if parsing
 * takes longer than 500ms.
 * NOTE: wrap this component into a 'relative' positioned container for pending overlay to cover only the textareaDiv.
 * 
 * Use {@link getTextareaDivDivElement} and {@link getTextareaDivTextareaElement} to retrieve the element.
 * 
 * @since 1.1.0
 */
export default forwardRef(function TextareaDiv(
    {
        parseDiv,
        parseTextarea,
        defaultValue = "",
        defaultMode = "div",
        setValue,
        setMode,
        ...props
    }: Props, 
    ref: Ref<HTMLDivElement | HTMLTextAreaElement>
) {
    const [currentMode, setCurrentMode] = useState<TextareaDivMode>(defaultMode);
    const [currentContent, setCurrentContent] = useState<string>(defaultValue);
    // the number of lines in the textarea value
    const [textareaRows, setTextareaRows] = useState(-1);

    const [isParsing, setParsing] = useState(false);
    /** Duration (in ms) a parsing function may take before a pending indicator is beeing displayed */
    const parsingTakesLongerDuration = 500;

    const componentRef = useRef<HTMLDivElement | HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => componentRef.current! , []);

    const textareaRef = componentRef as RefObject<HTMLTextAreaElement>;
    const divRef = componentRef as RefObject<HTMLDivElement>;

    const componentName = `TextareaDiv`;
    const { className, onBlur, onMouseDown, onClick, onChange, ...otherProps } = getCleanDefaultProps(props, componentName);

    useEffect(() => {
        updateContentState(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        updateModeState(defaultMode);
    }, [defaultMode]);

    async function divToTextarea(): Promise<void> {
        if (currentMode === "textarea")
            return;
        
        // prepare pending indicator
        const parsingTimeout = setTimeout(() => {
            setParsing(true);
        }, parsingTakesLongerDuration);

        try {
            const textareaValue = await parseTextarea(divRef.current!.innerHTML, divRef.current!);

            clearTimeout(parsingTimeout);
            setParsing(false);

            // case: num lines not initialized yet
            if (textareaRows < 1)
                setTextareaRows(countTextareaLines(textareaValue));
            
            updateModeState("textarea");
            updateContentState(textareaValue);

        } catch (e) {
            logError(e);
        }
    }

    async function textareaToDiv(): Promise<void> {
        if (currentMode === "div")
            return;
        
        try {
            // prepare pending indicator
            const parsingTimeout = setTimeout(() => {
                setParsing(true);
            }, parsingTakesLongerDuration);

            const divInnerHtml = await parseDiv(textareaRef.current!.value, textareaRef.current!);
            
            clearTimeout(parsingTimeout);
            setParsing(false);

            updateModeState("div");
            updateContentState(divInnerHtml);

        } catch (e) {
            logError(e);
        }
    }

    async function handleDivMouseDown(event: MouseEvent): Promise<void> {
        try {
            if (onMouseDown)
                onMouseDown(event);
        } catch (e) {
            logDebug(e);
            // case: threw exception on purpose, don't continue
            return;
        }
    
        await divToTextarea();
        setTimeout(() => {
            textareaRef.current!.focus();
        }, 10);
    }
    
    function handleTextareaBlur(event: FocusEvent): void {
        textareaToDiv();
        
        if (onBlur)
            onBlur(event);
    }

    async function handleDivClick(event: MouseEvent): Promise<void> {
        try {
            if (onClick)
                onClick(event);

        } catch (e) {
            logDebug(e);
            // case: threw exception on purpose, don't continue
            return;
        }
        
        await divToTextarea();
        setTimeout(() => textareaRef.current!.focus(), 10);
    }

    function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>): void {
        if (onChange)
            onChange(event);

        setTextareaRows(countTextareaLines(textareaRef.current!));
    }

    function updateContentState(content: string): void {
        setCurrentContent(content);

        if (setValue)
            setValue(content);
    }

    function updateModeState(mode: TextareaDivMode): void {
        setCurrentMode(mode);

        if (setMode)
            setMode(mode);
    }

    return (
        <Fragment>
            {currentMode === "div" &&
                <div
                    className={`${className} ${componentName}-div`} 
                    ref={divRef}
                    onBlur={onBlur} 
                    onClick={handleDivClick}
                    onMouseDown={handleDivMouseDown}
                    {...otherProps}
                >
                    <Sanitized dirtyHTML={`<div>${currentContent}</div>`} />
                </div>
            }

            {currentMode === "textarea" &&
                <textarea 
                    className={`${className} ${componentName}-textarea`} 
                    defaultValue={currentContent} 
                    ref={textareaRef}
                    rows={textareaRows}
                    onChange={handleTextareaChange}
                    onBlur={handleTextareaBlur}
                    onMouseDown={onMouseDown}
                    onClick={onClick}
                    {...otherProps} 
                />
            }

            <Overlay 
                isOverlayVisible={isParsing} 
                setIsOverlayVisible={setParsing} 
            >
                <SpinnerIcon />
            </Overlay>
        </Fragment>
    );
})    

/**
 * @param parentElement parent container that should have a `<TextareaDiv>` element
 * @returns the `<div>` element of the first TextareaDiv in `parentElement` or `null`
 */
export function getTextareaDivDivElement(parentElement: HTMLElement | null): HTMLDivElement | null {
    const textareaDiv = parentElement?.querySelector(".TextareaDiv");
    if (!textareaDiv || !(textareaDiv instanceof HTMLDivElement)) {
        logDebug(`Failed to get <TextareaDiv> div element. Not a div element right now: ${textareaDiv}`);
        return null;
    }

    return textareaDiv;
}

/**
 * @param parentElement parent container that should have a `<TextareaDiv>` element
 * @returns the `<textarea>` element of the first TextareaDiv in `parentElement` or `null`
 */
export function getTextareaDivTextareaElement(parentElement: HTMLElement | null): HTMLTextAreaElement | null {
    const textareaDiv = parentElement?.querySelector(".TextareaDiv");
    if (!textareaDiv || !(textareaDiv instanceof HTMLTextAreaElement)) {
        logDebug(`Failed to get <TextareaDiv> textarea element. Not a textarea element right now: ${textareaDiv}`);
        return null;
    }

    return textareaDiv;
}