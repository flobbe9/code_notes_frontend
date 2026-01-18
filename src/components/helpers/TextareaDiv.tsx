import DefaultProps, { getCleanDefaultProps } from "@/abstract/DefaultProps";
import { logDebug, logError } from "@/helpers/logUtils";
import React, { FocusEvent, forwardRef, Fragment, MouseEvent, Ref, RefObject, useImperativeHandle, useRef, useState } from "react";
import Sanitized from "./Sanitized";

type Mode = "textarea" | "div";

interface Props extends Omit<DefaultProps, "children"> {
    /**
     * Called upon switching from textarea to div.
     * 
     * @param textareaValue `value` of the textarea element
     * @returns the innerHtml for the div
     */
    parseDiv: (textareaValue: string, textarea: HTMLTextAreaElement) => Promise<string>,

    /**
     * Called upon switching from div to textarea.
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
    defaultMode?: Mode,

    /**
     * Initial content of the div / textarea. Should match `defaultMode`.
     * 
     * Default is "".
     */
    defaultValue?: string,
    
    /**
     * State setter for keeping track of the current content. Will either set the div's innerHTML or the textarea's value.
     */
    setValue?: (value: string) => void
}

/**
 * Will render a `<textarea>` element while focused and a `<div>` element while unfocused.
 * 
 * @since latest
 */
// TODO: 
    // comment example on how to retrieve value with dom
    // MouseDowning on the div while another input is focused will not focus the textarea
    // selecting the div's text is not possible without converting to textarea
        // consider double click to focus
export default forwardRef(function TextareaDiv(
    {
        parseDiv,
        parseTextarea,
        defaultValue = "",
        defaultMode = "div",
        setValue,
        ...props
    }: Props, 
    ref: Ref<HTMLDivElement | HTMLTextAreaElement>
) {
    const [currentMode, setCurrentMode] = useState<Mode>(defaultMode);
    const [currentContent, setCurrentContent] = useState<string>(defaultValue);
    
    const componentRef = useRef<HTMLDivElement | HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => componentRef.current! , []);

    const textareaRef = componentRef as RefObject<HTMLTextAreaElement>;
    const divRef = componentRef as RefObject<HTMLDivElement>;

    const componentName = `TextareaDiv`;
    const { className, onBlur, onMouseDown, onClick, ...otherProps } = getCleanDefaultProps(props, componentName);

    async function divToTextarea(): Promise<void> {
        if (currentMode === "textarea")
            return;
        
        try {
            const textareaValue = await parseTextarea(divRef.current!.innerHTML, divRef.current!);

            setCurrentMode("textarea");
            setCurrentContent(textareaValue);
            if (setValue)
                setValue(textareaValue)

        } catch (e) {
            // TODO
            logError(e);
        }
    }

    async function textareaToDiv(): Promise<void> {
        if (currentMode === "div")
            return;
        
        try {
            const divInnerHtml = await parseDiv(textareaRef.current!.value, textareaRef.current!);

            setCurrentMode("div");
            setCurrentContent(divInnerHtml);
            if (setValue)
                setValue(divInnerHtml)

        } catch (e) {
            // TODO
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
    
        // TODO: improove focus behaviour
        await divToTextarea();
        setTimeout(() => textareaRef.current!.focus(), 10);
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
                    onBlur={handleTextareaBlur}
                    onMouseDown={onMouseDown}
                    onClick={onClick}
                    {...otherProps} 
                />
            }
        </Fragment>
    );
})