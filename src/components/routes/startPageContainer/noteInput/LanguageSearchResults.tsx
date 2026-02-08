import { JSX, KeyboardEvent, useEffect, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import HelperProps from "../../../../abstract/HelperProps";
import { logWarn } from "../../../../helpers/logUtils";
import { slideDown, slideUp, toUpperCaseFirstChar } from "../../../../helpers/utils";
import HelperDiv from "../../../helpers/HelperDiv";
import HiddenInput from "../../../helpers/HiddenInput";


interface Props extends HelperProps {

    languageSearchResults: string[],

    /** Executed on result select */
    handleSelect: (language: string) => void,

    setShowLanguageSearchResults: (isRendered: boolean) => void
}


/**
 * Hidden by default. Toggle by updating ```rendered``` state.
 * 
 * @since 0.0.1
 */
export default function LanguageSearchResults({
    rendered = false,
    languageSearchResults = [],
    setShowLanguageSearchResults,
    handleSelect,
    ...props
}: Props) {

    const [searchResultElements, setSearchResultElements] = useState<JSX.Element[]>([]);

    const { children, ...otherProps } = getCleanDefaultProps(props, "LanguageSearchResults");

    const componentRef = useRef<HTMLDivElement>(null);
    const hiddenCheckboxRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        handleRenderdChange();

    }, [rendered]);


    useEffect(() => {
        setSearchResultElements(mapResults());

    }, [languageSearchResults])


    function handleSearchResultFocus(event): void {

        // set searcbar value to result value
        const searchBarInputElement = getSearchBarInputElement();
        if (!searchBarInputElement) {
            logWarn("Failed to find searchBarInputElement")
            return;
        }

        searchBarInputElement.value = event.target.value;
    }


    function handleSearchResultBlur(): void {

        if (!isArrowKeyPressed())
            setShowLanguageSearchResults(false);
    }


    function handleSearchResultKeyDown(event: KeyboardEvent, searchResult: string): void {

        // toggle checkbox
        const keyName = event.key;
        
        if (keyName === "ArrowDown")
            handleArrowDown(event);

        else if (keyName === "ArrowUp") 
            handleArrowUp(event);

        else if (keyName === "Enter")
            handleSelect(searchResult);
    }


    function handleSearchResultKeyUp(): void {

        setArrowKeyPressed(false);
    }


    function handleArrowDown(event: KeyboardEvent): void {

        event.preventDefault();

        setArrowKeyPressed(true);

        ((event.target as HTMLElement).nextElementSibling as HTMLElement).focus();
    }
    

    function handleArrowUp(event: KeyboardEvent): void {

        const focusedInput = event.target;
        const prevResult = (focusedInput as HTMLInputElement).previousElementSibling as HTMLElement;

        event.preventDefault();

        setArrowKeyPressed(true);

        // case: is first result
        if (!prevResult) 
            getSearchBarInputElement()?.focus();
        
        else
            prevResult.focus();
    }


    function handleSearchResultMouseDown(searchResult: string): void {

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
                    key={0}
                    value="No results..."
                    disabled
                />
            ];

        return languageSearchResults.map((searchResult, i) => {
            const upperCaseSearchResult = toUpperCaseFirstChar(searchResult);

            return <input 
                className="searchResultInput" 
                spellCheck={false}
                value={upperCaseSearchResult}
                tabIndex={-1}
                title={upperCaseSearchResult}
                key={i}
                onKeyDown={(event) => handleSearchResultKeyDown(event, upperCaseSearchResult)}
                onKeyUp={handleSearchResultKeyUp}
                onFocus={handleSearchResultFocus}
                onBlur={handleSearchResultBlur}
                onMouseDown={() => handleSearchResultMouseDown(upperCaseSearchResult)}
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

        hiddenCheckboxRef.current!.checked = keyPressed;
    }


    /**
     * Serves as pseudo state  because react states are too slow for this purpose. 
     * 
     * @reutrn ```true``` if an arrow key (up or down) is currently in "keydown" mode or not
     */
    function isArrowKeyPressed(): boolean {
        
        return hiddenCheckboxRef.current!.checked;
    }


    /**
     * Assumes that this component is an immediate child of ```#languageSearchBar```.
     * 
     * @returns the language searchbar for this component or ```undefined```
     */
    function getSearchBarInputElement(): HTMLInputElement | undefined {

        const languageSearchBarChildren = componentRef.current!.parentElement?.children;
        if (!languageSearchBarChildren)
            return undefined;

        return Array.from(languageSearchBarChildren)
            .find(child => child.classList.contains("searchInput")) as HTMLInputElement
    }


    function handleRenderdChange(): void {

        if (rendered)
            slideDown(componentRef.current!, 100, "ease", {}, () => {
                // makes height adjust to number of results
                componentRef.current!.style.height = "unset !important";
            });
            
        else
            slideUp(componentRef.current!)
    }


    return (
        <HelperDiv ref={componentRef} {...otherProps}>
            {searchResultElements}

            {children}
                
            {/* Is arrow key pressed "state" */}
            <HiddenInput ref={hiddenCheckboxRef} type="checkbox" tabIndex={-1} />
        </HelperDiv>
    )
}
