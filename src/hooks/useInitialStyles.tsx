import { Ref, useContext, useEffect } from "react";
import { log, logWarn } from "../helpers/utils";
import { AppContext } from "../components/App";



/**
 * As soon as given ```element``` is present, set value of ```cssAttributeToChange``` to value of ```cssAttributeToUse```:
 * 
 * ```element.css(cssAttributeToChange, element.css(cssAttributeToUse));```.
 * 
 * Uses {@link AppContext}.
 * 
 * @param element to set the styles for. May be an uninitialized jquery object from a state
 * @param cssAttributes touples formatted like ```[cssAttributeToChange, cssAttributeToUse]```.
 * @param timeout milliseconds after which to set the styles. Default is 0
 */
export function useInitialStyles(
    element: JQuery | undefined,
    cssAttributes: [string, string][],
    timeout = 0
) {

    const { windowSize } = useContext(AppContext);


    useEffect(() => {
        setInitialStyle();

    }, [element]);


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
     * Iterate attributes and execute ```callback``` on all of them. 
     * 
     * @param callback to execute
     */
    function attributesCallback(callback: (cssAttributeToChange: string, cssAttributeToUse: string, element: JQuery) => any): any {

        // case: element not present (yet)
        if (!element || !element.length)
            return;

        cssAttributes.forEach(touple => {
            callback(touple[0], touple[1], element);
        });
    }
}