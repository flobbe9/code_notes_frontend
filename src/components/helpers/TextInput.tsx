import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getCleanDefaultProps } from '../../abstract/DefaultProps';
import HelperProps from '../../abstract/HelperProps';
import { InputValidationWrapper } from "../../abstract/InputValidationWrapper";
import '../../assets/styles/TextInput.scss';
import { INVALID_INPUT_CLASS_NAME } from '../../helpers/constants';
import { addClass, isBlank, isBooleanFalsy, removeClass } from '../../helpers/utils';
import Button from "./Button";
import Flex from './Flex';

interface Props extends HelperProps {
    /** Default is "" */
    placeholder?: string;

    /** Default is "text" */
    type?: "text" | "password" | "email";

    /** Default is "" */
    defaultValue?: string;

    inputValidationWrappers?: InputValidationWrapper[];

    /** Default is ```false``` */
    required?: boolean;

    /** Default is "" */
    name?: string;

    /** Default is ```false``` */
    readonly?: boolean;

    /** Component will validate when this value changes and is not ```undefined``` */
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
        inputValidationWrappers,
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
    const [invalidMessage, setInvalidMessage] = useState("_"); // always needs some non-blank value

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, 'TextInput');

    const inputRef = useRef<HTMLInputElement>(null);
    const floatingLabelRef = useRef<HTMLDivElement>(null);

    // state is password visible


    useImperativeHandle(ref, () => inputRef.current!, []);


    useEffect(() => {
        updateFloatingLabel();
    }, [defaultValue]);


    useEffect(() => {
        if (!isBooleanFalsy(triggerValidation)) validateInput(false);
    }, [triggerValidation]);


    function handleChange(event: any): void {
        if (disabled) 
            return;

        if (onChange) 
            onChange(event);

        updateFloatingLabel();

        validateInput(true);
    }


    /**
     * Move floating label up if input is not blank or down if it is.
     */
    function updateFloatingLabel(): void {
        const floatingLabelDownClass = 'moveFloatingLabelDown';
        const floatingLabel = floatingLabelRef.current!;

        if (isMoveFloatingLabelDown()) 
            addClass(floatingLabel, floatingLabelDownClass);
        else 
            removeClass(floatingLabel, floatingLabelDownClass);
    }


    function isMoveFloatingLabelDown(): boolean {
        const input = inputRef.current!;

        // move down if value is blank and not focuesd or dontMoveFloatingLabel is true
        return (isBlank(input.value) && !input.matches(':focus')) || dontMoveFloatingLabel;
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


    function handleFloatingLabelClick(event: React.MouseEvent): void {

        if (disabled) 
            return;

        inputRef.current!.focus();
    }

    
    function validateInput(isChangeEvent: boolean): void {

        if (!inputValidationWrappers || !inputValidationWrappers.length)
            return;

        const input = inputRef.current!;

        for (const validationWrapper of inputValidationWrappers) {
            if (!validationWrapper)
                continue;

            // case: dont validate on change
            if (isChangeEvent && !validationWrapper.validateOnChange)
                continue;

            // case: is valid
            if (validationWrapper.predicate(input.value))
                continue;

            // case: is invalid
            input.classList.add(INVALID_INPUT_CLASS_NAME);
            setInvalidMessage(validationWrapper.errorMessage);

            return;
        }

        input.classList.remove(INVALID_INPUT_CLASS_NAME);
    }


    function getInputType(): "text" | "password" | "email" {

        if (type !== "password")
            return type;

        return isPasswordVisible ? "text" : "password";
    }
    

    return (
        <Flex
            id={id}
            className={className}
            style={style}
            rendered={rendered}
            {...otherProps}
        >
            <div className="TextInput-container fullWidth">
                <div 
                    className="floatingLabel transition" 
                    ref={floatingLabelRef} 
                    onClick={handleFloatingLabelClick}
                >
                    {placeholder} {required && <span className="requiredAsterisk">*</span>}
                </div>

                <input
                    className="textInput"
                    disabled={disabled}
                    type={getInputType()}
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

                {/* Show password button */}
                <Button 
                    className="TextInput-showPasswordButton"
                    rendered={type === "password"} 
                    title={(isPasswordVisible ? "Hide" : "Show") + " password"}
                    tabIndex={-1}
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                    {
                        isPasswordVisible ? 
                            <i className="fa-regular fa-eye-slash"></i>:
                            <i className="fa-regular fa-eye"></i> 
                    }
                </Button>

                <div className="textInputErrorMessage">{invalidMessage}</div>
            </div>

            {children}
        </Flex>
    );
});
