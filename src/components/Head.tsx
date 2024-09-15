import $ from "jquery";
import React, { useEffect } from "react";
import { useLocation } from "react-router";


interface Props {

    /** Array of valid html tags as string to append to head. E.g. ```"<title>mypge</title>"``` */
    headTagStrings?: string[],
}


/**
 * Serves as custom ```<head>``` tag. Will add given ```headTagStrings``` to actual ```<head>``` and remove them on navigate.
 * 
 * Not reading any other props or children
 * 
 * @since 0.2.0
 */
export default function Head({headTagStrings = []}: Props) {

    const location = useLocation();


    useEffect(() => {
        removeFromHead();
        addToHead();
        
    }, [location]);


    /**
     * Create html elements from ```headTagStrings```, add ".headTag" class and append them to ```<head>``` tag.
     */
    function addToHead(): void {

        headTagStrings.forEach(headTagString => {
            const headTag = $(headTagString);

            // add class in order to remove this later
            headTag.addClass("headTag");

            $("head").append(headTag);
        });
    }


    /**
     * Remove all tags added by {@link addToHead}.
     */
    function removeFromHead(): void {

        $(".headTag").remove();
    }


    return (<></>)
}