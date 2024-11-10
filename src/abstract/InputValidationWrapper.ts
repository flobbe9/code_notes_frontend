import { logWarn } from "../helpers/utils";


/**
 * @since 0.0.1
 */
export interface InputValidationWrapper {
    /**
     * Indicates whether the input is valid.
     * 
     * @param value to validate, usually the input value
     * @returns ```true``` if input can be considered valid, else ```false```
     */
    predicate: (value?: any) => boolean,
    errorMessage: string,
    /** Indicates whether to call the ```predicate``` on the input change event */
    validateOnChange: boolean
}


/**
 * Call all predicates of given inputValidationWrappers each with one of the given ```predicateArgs```.
 * 
 * @param inputValidationWrapperRecord contains the wrapper array with the predicates
 * @param predicateArgs the input values to pass to each predicate as arg. Needs to match the length and order of the wrapper record. 
 *                      If ommitted, predicates will be called without any args.
 * @returns ```true``` if all wrapper predicates return ```true```, else ```false```
 */
export function isInputValidationWrapperRecordValid(inputValidationWrapperRecord: Record<any, InputValidationWrapper[]>, predicateArgs?: any[]): boolean {
    
    if (!inputValidationWrapperRecord)
        return false;

    // case: inputs and predicate values length does not match
    if (predicateArgs && Object.keys(inputValidationWrapperRecord).length !== predicateArgs.length) {
        logWarn("Failed to validate input wrappers. 'inputValidationWrappers' and 'predicateArgs' must have the same length");
        return false;
    }

    return !Object.values(inputValidationWrapperRecord)
        .find((inputValidationWrappers, i) => 
            !areInputValidationWrappersValid(inputValidationWrappers, !predicateArgs ? undefined : predicateArgs[i]))
}


/**
 * Call all predicates of given ```inputValidationWrappers``` passing given ```predicateArg```.
 * 
 * @param inputValidationWrappers the wrapper array with the predicates
 * @param predicateArg the input value to pass to predicate as arg. 
 * @returns ```true``` if all wrapper predicates return ```true```, else ```false```
 */
export function areInputValidationWrappersValid(inputValidationWrappers: InputValidationWrapper[], predicateArg?: any): boolean {

    if (!inputValidationWrappers)
        return false;

    return !inputValidationWrappers
        .find(inputValidationWrapper => 
            !isInputValidationWrapperValid(inputValidationWrapper, predicateArg));
}


/**
 * Call predicate of given ```inputValidationWrapper``` each with one of the given ```predicateArg```.
 * 
 * @param inputValidationWrapper 
 * @param predicateArg 
 * @returns ```true``` if wrapper predicate returns ```true```, else ```false```
 */
export function isInputValidationWrapperValid(inputValidationWrapper: InputValidationWrapper, predicateArg?: any): boolean {

    if (!inputValidationWrapper)
        return false;

    return inputValidationWrapper.predicate(predicateArg);
}