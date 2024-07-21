import React, { useRef } from "react";
import "../assets/styles/LanguageSearchResults.scss";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import { moveCursor } from "../helpers/utils";
import HelperDiv from "./helpers/HelperDiv";
import HelperProps from "../abstract/HelperProps";
import { getRandomString } from './../helpers/utils';


interface Props extends HelperProps {

    possibleSearchResults: string[],

    /** Executed on result select */
    handleSelect: (language: string) => void
}


/**
 * @since latest
 */
export default function LanguageSearchResults({
    rendered = false,
    possibleSearchResults = [],
    handleSelect,
    ...props
}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "LanguageSearchResults");

    const componentRef = useRef(null);

    const inputRef = useRef(null);

    // TODO
        // pass list
        // default value = selected element
        // add option "none"
        // on search result select
            // set input value
            // hide search results
        // on empty search
            // show all possible results
        // go through with arrows instead with tabs
            // on key down
                // prevent default (scroll)
                // if next input is present
                    // focus next input
                // else
                    // focus first input
            // on key up
                // prevent default (scroll)
                // if prev input is present
                    // focus prev input
                // else
                    // focus last input
            // tab should move on
            // shift tab should focus search input
        // on focus out

    function handleFocus(event): void {

        // prevent input text select on focus
        moveCursor($(event.target), 0);
    }


    function handleKeyDown(event): void {

    }


    function mapResults(): JSX.Element[] {

        return possibleSearchResults.map(result => {
            return <input 
                className="searchResult" 
                readOnly 
                value={result}
                onFocus={handleFocus}
                tabIndex={-1}
                key={getRandomString()}
                onClick={() => handleSelect(result)}
            />
        })
    }


    return (
        <HelperDiv 
            id={id} 
            className={className}
            style={style}
            ref={componentRef}
            rendered={rendered}
            {...otherProps}
        >
            {mapResults()}
                
            {children}
        </HelperDiv>
    )
}