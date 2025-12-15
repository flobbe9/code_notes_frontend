import React, { createContext, forwardRef, KeyboardEvent, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from '../../abstract/DefaultProps';
import HelperProps from '../../abstract/HelperProps';
import { InputValidationWrapper } from "../../abstract/InputValidationWrapper";
import { addClass, getRandomString, slideDown, slideUp } from "../../helpers/utils";
import { useHasComponentMounted } from "../../hooks/useHasComponentMounted";
import { AppContext } from '../App';
import Flex from './Flex';
import HelperDiv from './HelperDiv';
import SelectOption from './SelectOption';
import TextInput from './TextInput';

interface Props extends HelperProps {
    /** Default is "" */
    placeholder?: string;

    options: string[];

    /** If ```true``` selected options will be marked and no selected option will be display as label. Default is ```false``` */
    multiSelect?: boolean;

    /** If ```true``` an empty option will be prepended to the list. Default is false */
    addEmptyOption?: boolean;

    selectedOptions: Set<string>;

    setSelectedOptions: (selectedOption: Set<string>) => void;

    /** Default is ```false``` */
    required?: boolean;

    inputValidationWrappers?: InputValidationWrapper[]
}

/**
 * Children wont be rendered. In order to toggle "invalid styles" given the text input the ```INVALID_INPUT_CLASS_NAME``` class.
 *
 * Ref will be passed to ```<TextInput>```.
 *
 * Uses first option as default value
 *
 * @since 0.0.1
 * @author Florin Schikarski
 */
export default forwardRef(function Select(
    {
        placeholder,
        options,
        required,
        multiSelect = false,
        addEmptyOption = false,
        inputValidationWrappers = [],
        selectedOptions = new Set(),
        setSelectedOptions,
        ...props
    }: Props,
    ref: Ref<HTMLInputElement>
) {
    const [optionElements, setOptionElements] = useState<JSX.Element[]>([]);
    const [isOptionsContainerVisible, setIsOptionsContainerVisible] = useState(false);
    const [triggerValidation, setTriggerValidation] = useState<boolean>();

    const [isArrowDownKeyPressed, setIsArrowDownKeyPressed] = useState(false);

    const { isKeyPressed } = useContext(AppContext);

    const hasComponentMounted = useHasComponentMounted();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, 'Select');

    const textInputRef = useRef<HTMLInputElement>(null);
    const optionsContainerRef = useRef<HTMLDivElement>(null);

    const context = {
        selectedOptions
    };

    useImperativeHandle(ref, () => textInputRef.current!, []);


    useEffect(() => {
        if (hasComponentMounted) {
            const optionElements = mapOptionElements();
            setOptionElements(optionElements);
            setSelectedOptions(optionElements.length ? new Set([optionElements[0].props.label]) : new Set());
        }
    }, [options, hasComponentMounted]);


    useEffect(() => {
        if (hasComponentMounted) 
            updateTriggerValidation();
    }, [selectedOptions]);


    useEffect(() => {
        if (isOptionsContainerVisible) 
            showOptionsContainer() 
        else 
            hideOptionsContainer();

    }, [isOptionsContainerVisible]);


    function mapOptionElements(): JSX.Element[] {

        if (!options) 
            return [];

        const optionElements: JSX.Element[] = [];

        options.forEach((optionName, i) => {
            // add empty option at the top
            if (i === 0 && addEmptyOption) 
                optionElements.push(getSingleOption(''));

            optionElements.push(getSingleOption(optionName));
        });

        return optionElements;
    }

    function getSingleOption(optionName: string): JSX.Element {
        return (
            <SelectOption
                label={optionName}
                multiSelect={multiSelect}
                title={optionName}
                key={getRandomString()}
                tabIndex={-1}
                onMouseDownCapture={() => handleOptionSelect(optionName)}
                onKeyDown={event => handleOptionsKeyDown(event, optionName)}
            />
        );
    }

    function handleOptionSelect(optionName: string): void {
        // case: only one option possible
        if (!multiSelect) setSelectedOptions(new Set([optionName]));
        else {
            // case: was already selected
            if (selectedOptions.has(optionName)) selectedOptions.delete(optionName);
            // case: was not selected
            else selectedOptions.add(optionName);

            setSelectedOptions(new Set(selectedOptions));
        }

        setIsOptionsContainerVisible(false);
    }

    function handleOptionsKeyDown(event: KeyboardEvent, optionName: string): void {
        const textInput = textInputRef.current!;
        const thisOption = event.target as HTMLElement;

        event.preventDefault();

        if (event.key === 'ArrowDown') 
            (thisOption.nextElementSibling as HTMLElement)?.focus();

        else if (event.key === 'ArrowUp') {
            const prevOption = (thisOption.previousElementSibling as HTMLElement);
            prevOption?.focus();

            // case: no previous option
            if (!prevOption) 
                textInput.focus();

            // focus previous option
            else 
                prevOption.focus();

        } else if (event.key === 'Tab') 
            textInput.focus();

        else if (event.key === 'Enter') 
            handleOptionSelect(optionName);
    }

    function handleArrowMouseDownCapture(event: any): void {

        const textInput = textInputRef.current!;

        // case: text input not focused
        if (!textInput.matches(':focus')) {
            // hide via state
            if (isOptionsContainerVisible) 
                setIsOptionsContainerVisible(false);

            // focus and prevent default blur
            else {
                event.preventDefault();
                textInput.focus();
            }
        }
    }

    function handleTextInputBlur(): void {

        // hide options except arrow down selects them
        if (!isArrowDownKeyPressed) 
            setIsOptionsContainerVisible(false);
    }

    function handleTextInputKeyDownCapture(event: any): void {

        if (event.key === 'ArrowDown') 
            setIsArrowDownKeyPressed(true);
    }

    function handleTextInputKeyUp(): void {
        if (!isKeyPressed('ArrowDown')) 
            setIsArrowDownKeyPressed(false);
    }


    function handleTextInputKeyDown(event: any): void {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            // focus first option
            const firstOption = optionsContainerRef.current!.querySelector('.SelectOption') as HTMLElement;
            firstOption.focus();
        }
    }

    function handleTextInputFocus(): void {
        setIsOptionsContainerVisible(true);

        // prevent option text select
        textInputRef.current!.selectionEnd = 0;
    }


    function handleTextInputMouseDownCapture(event: any): void {
        const textInput = textInputRef.current!;

        // case: text input is focused
        if (textInput.matches(':focus')) {
            event.preventDefault();
            textInput.blur();

            // case: options visible but text input not focused
        } else if (isOptionsContainerVisible) {
            event.preventDefault();
            setIsOptionsContainerVisible(false);
        }
    }


    function hideOptionsContainer(): void {

        slideUp(optionsContainerRef.current);
    }
    
    
    function showOptionsContainer(): void {

        slideDown(optionsContainerRef.current)
    }


    /**
     * Will toggle the ```triggerValidation``` state except if the state has not changed yet.
     *
     * Called in ```useEffect``` hook on ```selectedOption``` change.
     */
    function updateTriggerValidation(): void {

        // case: option has been changed at least once
        if (textInputRef.current!.classList.contains('touched')) 
            setTriggerValidation(!triggerValidation);

        // case: option has been changed for the first time
        else 
            addClass(textInputRef.current!, 'touched');
    }


    return (
        <SelectContext.Provider value={context}>
            <HelperDiv id={id} className={className} style={style} {...otherProps}>
                {/* Select label */}
                <Flex verticalAlign="center" flexWrap="nowrap">
                    <TextInput
                        placeholder={placeholder}
                        defaultValue={multiSelect ? '' : selectedOptions.values().next().value || ''}
                        readonly
                        dontMoveFloatingLabel={multiSelect}
                        ref={textInputRef}
                        required={required}
                        inputValidationWrappers={inputValidationWrappers}
                        triggerValidation={triggerValidation}
                        onFocus={handleTextInputFocus}
                        onBlur={handleTextInputBlur}
                        onKeyDownCapture={handleTextInputKeyDownCapture}
                        onKeyDown={handleTextInputKeyDown}
                        onKeyUp={handleTextInputKeyUp}
                        onMouseDownCapture={handleTextInputMouseDownCapture}
                    />

                    <i
                        className="fa-solid fa-chevron-down hover"
                        style={{
                            rotate: isOptionsContainerVisible ? '-180deg' : '0deg'
                        }}
                        onMouseDownCapture={handleArrowMouseDownCapture}
                    />
                </Flex>

                {/* Select options */}
                <div className="selectOptionsContainer" ref={optionsContainerRef}>
                    {optionElements}
                </div>

                {children}
            </HelperDiv>
        </SelectContext.Provider>
    );
});

export const SelectContext = createContext({
    selectedOptions: new Set<string>()
});
