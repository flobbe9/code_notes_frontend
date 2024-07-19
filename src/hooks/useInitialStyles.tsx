import { useContext, useEffect } from "react";
import { log, logWarn } from "../helpers/utils";
import { AppContext } from "../components/App";



/**
 * On render set value of ```cssAttributeToChange``` to value of ```cssAttributeToUse```:
 * 
 * ```$(elementIdentifier).css(cssAttributeToChange, element.css(cssAttributeToUse));```.
 * 
 * Uses {@link AppContext}.
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

    const { windowSize } = useContext(AppContext);


    useEffect(() => {
        checkElementIdentifier();

        setInitialStyle();

    }, []);


    useEffect(() => {
        handleWindowResize();

    }, [windowSize]);


    /**
     * Set value of ```cssAttributeToChange``` to value of ```cssAttributeToUse```
     */
    function setInitialStyle(): void {

        setTimeout(() => {
            attributesCallback((cssAttributeToChange: string, cssAttributeToUse: string, element: JQuery) =>
                element.css(cssAttributeToChange, element.css(cssAttributeToUse)))

        }, timeout);
    }


    function handleWindowResize(): void {

        // unset attributes to change in order to cleanly set them again
        attributesCallback((cssAttributeToChange: string, cssAttributeToUse: string, element: JQuery) => 
            element.css(cssAttributeToChange, "unset"));

        setInitialStyle();
    }


    /**
     * Log a warning message if ```elementIdentifier``` is invalid.
     */
    function checkElementIdentifier(): void {

        const element = $(elementIdentifier);

        // case: falsy element
        if (!element || !element.length) 
            logWarn(`'useInitialStyle' failed. Element with 'elementIdentifier' ${elementIdentifier} is falsy`);
    }


    /**
     * Iterate attributes and execute ```callback``` on all of them. 
     * 
     * @param callback to execute
     */
    function attributesCallback(callback: (cssAttributeToChange: string, cssAttributeToUse: string, element: JQuery) => any): any {

        cssAttributes.forEach(touple => {
            callback(touple[0], touple[1], $(elementIdentifier));
        });
    }
}