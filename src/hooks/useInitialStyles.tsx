import { useEffect } from "react";
import { log, logWarn } from "../helpers/utils";



/**
 * On render set value of ```cssAttributeToChange``` to value of ```cssAttributeToUse```:
 * 
 * ```$(elementIdentifier).css(cssAttributeToChange, element.css(cssAttributeToUse));```
 * 
 * @param elementIdentifier of element to set the styles for. Will be used like ```element = $(elementIdentifier)```
 * @param cssAttributes touples formatted like ```[cssAttributeToChange, cssAttributeToUse]```.
 * @param timeout milliseconds after which to set the styles. Default is 0
 */
export function useInitialStyles(
    elementIdentifier: string, 
    cssAttributes: [string, string][],
    timeout = 0
) {

    useEffect(() => {

        setTimeout(() => {
            setInitialStyle();

        }, timeout);
    }, []);


    /**
     * Set value of ```cssAttributeToChange``` to value of ```cssAttributeToUse```
     */
    function setInitialStyle(): void {

        const element = $(elementIdentifier);

        // case: falsy element
        if (!element || !element.length) {
            logWarn(`Failed to set initial style. No element with 'elementIdentifier' ${elementIdentifier} is falsy`);
            return;
        }

        cssAttributes.forEach(touple => 
            element.css(touple[0], element.css(touple[1])))
    }
}