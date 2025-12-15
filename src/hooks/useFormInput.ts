import { useRef, useState } from "react";


/**
 * Generates some states usefull for form inputs. Does nothing else, this hook is simply for reducing repetitive code.
 * 
 * @type ```ValueType``` type of the input value, e.g. "string"
 * @type ```RefType``` type of the ref, e.g. ```HTMLInputElement```
 * @param defaultValue for the input value hook
 * @returns state for input value, state for input validation, ref for the input (initialized with ```null```)
 * @since 0.0.1
 */
export function useFormInput<ValueType, RefType>(defaultValue: ValueType) {

    const [inputValue, setInputValue] = useState<ValueType>(defaultValue);
    const [triggerInputValidation, setTriggerInputValidation] = useState<boolean | undefined>(undefined);
    const inputRef = useRef<RefType>(null);

    return {
        inputValue, setInputValue,
        triggerInputValidation, setTriggerInputValidation,
        inputRef
    }
}
