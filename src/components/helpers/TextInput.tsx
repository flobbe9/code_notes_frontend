import $ from "jquery";
import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef } from 'react';
import '../../assets/styles/TextInput.scss';
import { getCleanDefaultProps } from '../../abstract/DefaultProps';
import Flex from './Flex';
import HelperProps from '../../abstract/HelperProps';
import { isBlank, isBooleanFalsy, log } from '../../helpers/utils';
import { INVALID_INPUT_CLASS_NAME } from '../../helpers/constants';

interface Props extends HelperProps {
    /** Default is "" */
    placeholder?: string;

    /** Default is "text" */
    type?: "text" | "password";

    /** Default is "" */
    defaultValue?: string;

    /** Will be called on key up and toggle "invalid style" if returns ```false``` */
    isValidPredicate?: (inputValue: string) => boolean;

    /** Default is "" */
    invalidMessage?: string;

    /** Default is ```false``` */
    required?: boolean;

    /** Default is "" */
    name?: string;

    /** Default is ```false``` */
    readonly?: boolean;

    /** Component will validate when this value changes and  is not ```null``` */
    triggerValidation?: boolean;

    /**
     * If ```true``` the floating label will always stay at the position of the placeholder. Default is ```false``` */
    dontMoveFloatingLabel?: boolean;
}

/**
 * Children wont be rendered. In order to toggle "invalid styles" given the text input the {@link INVALID_INPUT_CLASS} class.
 *
 * @since 0.0.1
 * @author Florin Schikarski
 */
export default forwardRef(function TextInput(
    {
        placeholder = '',
        defaultValue = '',
        title = '',
        name = '',
        type = "text",
        isValidPredicate,
        invalidMessage = '',
        required = false,
        readonly,
        disabled,
        rendered,
        triggerValidation,
        dontMoveFloatingLabel = false,
        onKeyDownCapture,
        onKeyDown,
        onKeyUp,
        onChange,
        onBlur,
        onFocus,
        ...props
    }: Props,
    ref: Ref<HTMLInputElement>
) {
    const { id, className, style, ...otherProps } = getCleanDefaultProps(props, 'TextInput');

    const inputRef = useRef(null);
    const floatingLabelRef = useRef(null);

    useImperativeHandle(ref, () => inputRef.current!, []);

    useEffect(() => {
        updateFloatingLabel();
    }, []);

    useEffect(() => {
        updateFloatingLabel();
    }, [defaultValue]);

    useEffect(() => {
        if (!isBooleanFalsy(triggerValidation)) validateInput();
    }, [triggerValidation]);

    function handleChange(event: any): void {
        if (disabled) return;

        if (onChange) onChange(event);

        updateFloatingLabel();

        validateInput();
    }

    /**
     * Move floating label up if input is not blank or down if it is.
     */
    function updateFloatingLabel(): void {
        const floatingLabelDownClass = 'moveFloatingLabelDown';
        const floatingLabel = $(floatingLabelRef.current!);

        if (isMoveFloatingLabelDown()) floatingLabel.addClass(floatingLabelDownClass);
        else floatingLabel.removeClass(floatingLabelDownClass);
    }

    function isMoveFloatingLabelDown(): boolean {
        const input = $(inputRef.current!);

        // move down if value is blank and not focuesd or dontMoveFloatingLabel is true
        return (isBlank(input.prop('value')) && !input.is(':focus')) || dontMoveFloatingLabel;
    }

    function handleBlur(event: any): void {
        if (disabled) return;

        if (onBlur) onBlur(event);

        updateFloatingLabel();
    }

    function handleFocus(event: any): void {
        if (disabled) return;

        if (onFocus) onFocus(event);

        updateFloatingLabel();
    }

    /**
     * Call ```isValidPredicate``` if present and add {@link INVALID_INPUT_CLASS} class if it returns ```false```
     */
    function validateInput(): void {
        if (!isValidPredicate) return;

        const input = $(inputRef.current!);
        const invalidInputClass = INVALID_INPUT_CLASS_NAME;

        if (isValidPredicate(input.prop('value'))) input.removeClass(invalidInputClass);
        else input.addClass(invalidInputClass);
    }

    return (
        <Flex
            id={id}
            className={className}
            style={style}
            verticalAlign="end" // necessary?
            rendered={rendered}
            {...otherProps}
        >
            <div className="fullWidth">
                <div className="floatingLabel transition" ref={floatingLabelRef}>
                    {placeholder} {required && <span className="requiredAsterisk">*</span>}
                </div>

                <input
                    className="textInput"
                    disabled={disabled}
                    type={type}
                    defaultValue={defaultValue}
                    name={name}
                    title={title}
                    ref={inputRef}
                    readOnly={readonly}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={onKeyDown}
                    onKeyDownCapture={onKeyDownCapture}
                    onKeyUp={onKeyUp}
                />

                <div className="textInputErrorMessage">{invalidMessage}</div>
            </div>
        </Flex>
    );
});
