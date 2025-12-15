import React, { useEffect } from "react";
import { useLocation } from "react-router";
import { addClass, stringToHtmlElement } from "../../helpers/utils";


interface Props {

    /** Array of valid html tags as string to append to head. E.g. ```"<title>mypge</title>"``` */
    headTagStrings?: string[],

    rendered?: boolean
}


/**
 * Serves as custom ```<head>``` tag. Will add given ```headTagStrings``` to actual ```<head>``` and remove them on navigate.
 * 
 * Not reading any other props or children
 * 
 * @since 0.2.0
 */
export default function Head({headTagStrings = [], rendered = true}: Props) {

    const location = useLocation();
    const headTagClassName = "headTag";


    useEffect(() => {
        removeFromHead();
        addToHead();
        
    }, [location]);


    /**
     * Create html elements from ```headTagStrings```, add ".headTag" class and append them to ```<head>``` tag.
     */
    function addToHead(): void {

        if (!rendered)
            return;

        headTagStrings.forEach(headTagString => {
            const headTag = stringToHtmlElement(headTagString);

            // add class in order to remove this later
            addClass(headTag, headTagClassName);

            document.head.append(headTag);
        });
    }


    /**
     * Remove all tags added by {@link addToHead}.
     */
    function removeFromHead(): void {
        
        if (!rendered)
            return;

        document.querySelectorAll(`.${headTagClassName}`)
            .forEach(headTag => headTag.remove());
    }


    return (<></>)
}
