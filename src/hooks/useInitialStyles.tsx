import { useContext, useEffect } from "react";
import { AppContext } from "../components/App";
import { logWarn } from "../helpers/utils";



/**
 * As soon as given ```element``` is present, set value of ```cssAttributeToChange``` to value of ```cssAttributeToUse```:
 * 
 * ```element.css(cssAttributeToChange, element.css(cssAttributeToUse));```.
 * 
 * Uses {@link AppContext}.
 * 
 * @param element to set the styles for
 * @param cssAttributes touples formatted like ```[cssAttributeToChange, cssAttributeToUse]```.
 * @param timeout milliseconds after which to set the styles. Default is 0
 */
export function useInitialStyles(
    element: HTMLElement | undefined | null,
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

        if (!element)
            return;

        setTimeout(() => {
            attributesCallback((cssAttributeToChange: string, cssAttributeToUse: string, element: HTMLElement) => 
                element.style[cssAttributeToChange] = window.getComputedStyle(element).getPropertyValue(cssAttributeToUse))

        }, timeout);
    }


    function handleWindowResize(): void {
        
        if (!element) 
            return;

        // unset attributes to change in order to cleanly set them again
        attributesCallback((cssAttributeToChange: string, cssAttributeToUse: string, element: HTMLElement) => 
            element.style[cssAttributeToChange] = "unset");

        setInitialStyle();
    }


    /**
     * Iterate attributes and execute ```callback``` on all of them. 
     * 
     * @param callback to execute
     */
    function attributesCallback(callback: (cssAttributeToChange: string, cssAttributeToUse: string, element: HTMLElement) => any): any {

        if (!element)
            return;

        cssAttributes.forEach(touple => {
            callback(touple[0], touple[1], element);
        });
    }
}