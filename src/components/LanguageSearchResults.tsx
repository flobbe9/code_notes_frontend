import $ from "jquery";
import React, { useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/LanguageSearchResults.scss";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import { log, moveCursor, toUpperCaseFirstChar } from "../helpers/utils";
import HelperDiv from "./helpers/HelperDiv";
import HelperProps from "../abstract/HelperProps";
import { getRandomString } from './../helpers/utils';
import HiddenInput from "./helpers/HiddenInput";


interface Props extends HelperProps {

    languageSearchResults: string[],

    /** Executed on result select */
    handleSelect: (language: string) => void,

    setShowLanguageSearchResults: (isRendered: boolean) => void
}


/**
 * @since latest
 */
export default function LanguageSearchResults({
    rendered = false,
    languageSearchResults = [],
    setShowLanguageSearchResults,
    handleSelect,
    ...props
}: Props) {

    const [searchResultElements, setSearchResultElements] = useState<JSX.Element[]>([]);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "LanguageSearchResults");

    const componentRef = useRef(null);
    const hiddenCheckboxRef = useRef(null);


    useEffect(() => {
        setSearchResultElements(mapResults());

    }, [languageSearchResults])


    function handleSearchResultFocus(event): void {

        // prevent input text select on focus
        moveCursor($(event.target), 0);

        // set searcbar value to result value
        getSearchBar().prop("value", event.target.value)
    }


    function handleSearchResultBlur(event): void {

        if (!isArrowKeyPressed())
            setShowLanguageSearchResults(false);
    }


    function handleSearchResultKeyDown(event, searchResult: string): void {

        // toggle checkbox
        const keyName = event.key;
        
        if (keyName === "ArrowDown")
            handleArrowDown(event);

        else if (keyName === "ArrowUp") 
            handleArrowUp(event);

        else if (keyName === "Enter")
            handleSelect(searchResult);
    }


    function handleSearchResultKeyUp(event): void {

        setArrowKeyPressed(false);
    }


    function handleArrowDown(event): void {

        event.preventDefault();

        setArrowKeyPressed(true);

        $(event.target).next().trigger("focus");
    }
    

    function handleArrowUp(event): void {

        const focusedInput = $(event.target);
        const prevResult = focusedInput.prev();

        event.preventDefault();

        setArrowKeyPressed(true);

        // case: is first result
        if (!prevResult.length) 
            getSearchBar().trigger("focus");
        
        else
            prevResult.trigger("focus");
    }


    function handleSearchResultMouseDown(event, searchResult: string): void {

        handleSelect(searchResult);
    }


    function mapResults(): JSX.Element[] {
        
        // case: no results
        if (!languageSearchResults.length)
            return [
                <input 
                    className="searchResultInput" 
                    spellCheck={false}
                    tabIndex={-1}
                    key={getRandomString()}
                    value="No results..."
                    disabled
                />
            ];

        return languageSearchResults.map(searchResult => {
            const upperCaseSearchResult = toUpperCaseFirstChar(searchResult);

            return <input 
                className="searchResultInput" 
                spellCheck={false}
                value={upperCaseSearchResult}
                tabIndex={-1}
                title={upperCaseSearchResult}
                key={getRandomString()}
                onKeyDown={(event) => handleSearchResultKeyDown(event, upperCaseSearchResult)}
                onKeyUp={handleSearchResultKeyUp}
                onFocus={handleSearchResultFocus}
                onBlur={handleSearchResultBlur}
                onMouseDown={(event) => handleSearchResultMouseDown(event, upperCaseSearchResult)}
                onChange={() => {}} // prevent console error
            />
        })
    }


    /**
     * Serves as pseudo state setter because react states are too slow for this purpose. Indicates whether an
     * arrow key (up or down) is currently in "keydown" mode or not
     * 
     * @param keyPressed whether an arrow key is pressed or not
     */
    function setArrowKeyPressed(keyPressed: boolean): void {

        $(hiddenCheckboxRef.current!).prop("checked", keyPressed)
    }


    /**
     * Serves as pseudo state  because react states are too slow for this purpose. 
     * 
     * @reutrn ```true``` if an arrow key (up or down) is currently in "keydown" mode or not
     */
    function isArrowKeyPressed(): boolean {
        
        return $(hiddenCheckboxRef.current!).prop("checked")
    }


    /**
     * @returns the language searchbar for this component
     */
    function getSearchBar(): JQuery {

        return $(componentRef.current!).parents(".languageSearchBar").find(".searchInput");
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
            {searchResultElements}

            {children}
                
            {/* Is arrow key pressed "state" */}
            <HiddenInput ref={hiddenCheckboxRef} type="checkbox" tabIndex={-1} />
        </HelperDiv>
    )
}