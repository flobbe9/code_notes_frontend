import React, { KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import { CODE_BLOCK_LANGUAGES, CODE_BLOCK_WITH_VARIABLES_LANGUAGES, ProgrammingLanguage } from "../../../../abstract/ProgrammingLanguage";
import { BLOCK_SETTINGS_ANIMATION_DURATION } from "../../../../helpers/constants";
import { animateAndCommit, getCssConstant, includesIgnoreCaseTrim, isEventKeyTakingUpSpace } from "../../../../helpers/utils";
import Button from "../../../helpers/Button";
import Flex from "../../../helpers/Flex";
import SearchBar from "../../../helpers/SearchBar";
import { DefaultNoteInputContext } from "./DefaultNoteInput";
import LanguageSearchResults from "./LanguageSearchResults";
import { NoteContext } from "./Note";
import { moveCursor } from "../../../../helpers/projectUtils";


interface Props extends DefaultProps {

    /** Applies to the toggle button. Default should be ```false``` */
    areNoteInputSettingsDisabled: boolean,

    noteInputEntity: NoteInputEntity
}


/**
 * Component containing the language searchbar and noteInput switch for one noteInput.
 * 
 * @since 0.0.1
 */
export default function NoteInputSettings({noteInputEntity, areNoteInputSettingsDisabled, ...props}: Props) {
    
    const [showLanguageSearchResults, setShowLanguageSearchResults] = useState(false);
    
    /** List of all possible results */
    const [allLanguageSearchResults, setAllLanguageResults] = useState<ProgrammingLanguage[]>([]);
    /** List of results after searching. Init value is all results */
    const [languageSearchResults, setLanguageSearchResults] = useState<string[]>(mapLanguageNames(allLanguageSearchResults));

    const { updateNoteEdited } = useContext(NoteContext);
    const { 
        isShowNoteInputSettings, 
        setIsShowNoteInputSettings,

        setCodeNoteInputLanguage,
        setCodeNoteInputWithVariablesLanguage
        
    } = useContext(DefaultNoteInputContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "NoteInputSettings");

    const componentRef = useRef<HTMLDivElement>(null);
    // const noteInputSwitchRef = useRef(null);
    const languageSearchBarRef = useRef<HTMLInputElement>(null);

    // IDEA: make custom colors and pass them to buttons as border color



    useEffect(() => {
        const allLanguageSearchResults = getAllLanguagesByNoteInputType();

        setAllLanguageResults(allLanguageSearchResults);
        setLanguageSearchResults(mapLanguageNames(allLanguageSearchResults));

    }, []);


    // /**
    //  * Slide toggle the noteInput switch.
    //  * 
    //  * @param hide whether to hide the noteInput switch regardles of it's current state
    //  */
    // function toggleNoteInputSwitch(hide = isShowNoteInputSettings): void {

    //     const noteInputSwitch = $(noteInputSwitchRef.current!);

    //     // case: show noteInput settings
    //     if (!hide)
    //         // radio buttons back to static
    //         noteInputSwitch.children(".RadioButton").css("position", "static");

    //     // fake "toggle slide"
    //     noteInputSwitch.animate(
    //         {
    //             width: hide ? 0 : getCssConstant("noteInputSwitchWidth"),
    //             opacity: hide ? 0 : 1,
    //             zIndex: hide ? -1 : 0
    //         }, 
    //         BLOCK_SETTINGS_ANIMATION_DURATION,
    //         "swing",
    //         // radio buttons to absolute so they dont widen the container width
    //         () => noteInputSwitch.children(".RadioButton").css("position", (hide ? "absolute" : "static"))
    //     )
    // }


    /**
     * Slide toggle the language searchbar.
     * 
     * @param hide whether to hide the searchbar regardles of it's current state
     */
    function toggleLanguageSearchBar(hide = isShowNoteInputSettings): void {

        const languageSearchBar = componentRef.current!.querySelector(".languageSearchBar") as HTMLElement;
        const languageSearchBarWidth = getCssConstant("languageSearchBarWidth");

        if (!hide) {
            languageSearchBar.style.position = "relative";
            languageSearchBar.style.zIndex = "1";
        }

        // fake "toggle slide"
        animateAndCommit(
            languageSearchBar,
            { width: hide ? 0 : languageSearchBarWidth, opacity: hide ? 0 : 1 }, 
            { duration: BLOCK_SETTINGS_ANIMATION_DURATION },
            () => {
                languageSearchBar.style.position = (hide ? "absolute" : "relative");
                languageSearchBar.style.zIndex = hide ? "-1" : "1";
                if (!hide) {
                    languageSearchBarRef.current!.focus();
                    moveCursor((languageSearchBarRef.current!), 0, -1);
                }
            }
        )
    }


    /**
     * Slide toggle this component except the toggle button.
     * 
     * @param hide whether to hide the noteInput settings regardles of their current state
     */
    function toggleNoteInputSettings(hide = isShowNoteInputSettings): void {

        setIsShowNoteInputSettings(!hide);

        // toggleNoteInputSwitch(hide);
        toggleLanguageSearchBar(hide);
    }


    function handleLanguageSearchKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "ArrowDown") {
            event.preventDefault();

            const firstLanguageSearchResult = componentRef.current!.querySelector(".LanguageSearchResults input") as HTMLInputElement;
            firstLanguageSearchResult.focus();
            
            setShowLanguageSearchResults(true);
        
        } else if (keyName === "Escape") {
            languageSearchBarRef.current!.blur();
            setShowLanguageSearchResults(false);

        } else if (keyName === "Tab")
            setShowLanguageSearchResults(false);
    }
    
    
    function handleLanguageSearchFocus(event): void {
        
        setShowLanguageSearchResults(true);
    }
    
    
    function handleLanguageSearchBlur(): void {

        setShowLanguageSearchResults(false);
    }


    function handleSelectLanguage(language: string): void {

        // update language state
        if (noteInputEntity.type === "CODE")
            setCodeNoteInputLanguage(language);

        else if (noteInputEntity.type === "CODE_WITH_VARIABLES")
            setCodeNoteInputWithVariablesLanguage(language);

        // hide result box
        setShowLanguageSearchResults(false);

        // hide settings
        toggleNoteInputSettings(true);

        // set searchbar value to selected language
        languageSearchBarRef.current!.value = language;

        updateNoteEdited();
    }


    function handleLanguageSearchKeyUp(event: KeyboardEvent): void {

        const keyName = event.key;
        
        if (keyName === " ") 
            event.preventDefault();

        else if (isEventKeyTakingUpSpace(keyName, false) || keyName === "Backspace")
            handleLanguageSearch();
    }


    function handleLanguageSearch(): void {

        const currentSearchInputValue: string = languageSearchBarRef.current!.value;

        const newLanguageSearchResults: string[] = [];

        // find matches and map names
        allLanguageSearchResults.forEach(languageSearchResult => {
            if (searchInputValueMatchesLanguageSearchResult(currentSearchInputValue, languageSearchResult))
                newLanguageSearchResults.push(languageSearchResult.name);
        });

        // sort alphabetically
        newLanguageSearchResults.sort();

        setLanguageSearchResults(newLanguageSearchResults);
    }


    /**
     * @returns the complete list of available programming languages for current noteInput type
     */
    function getAllLanguagesByNoteInputType(): ProgrammingLanguage[] {

        if (noteInputEntity.type === "CODE")
            return CODE_BLOCK_LANGUAGES;

        if (noteInputEntity.type === "CODE_WITH_VARIABLES")
            return CODE_BLOCK_WITH_VARIABLES_LANGUAGES;

        return [];
    }


    /**
     * Indicates whether given search value matches given search result.
     * 
     * Use ```includesIgnoreCaseTrim``` as criteria for both name and aliases.
     * 
     * @param searchInputValue the search string the user typed
     * @param languageSearchResult the search result to check the input value against
     * @returns true if given input value either matches the languages name or at least one of the aliases
     */
    function searchInputValueMatchesLanguageSearchResult(searchInputValue: string, languageSearchResult: ProgrammingLanguage): boolean {

        const matchesName = includesIgnoreCaseTrim(languageSearchResult.name, searchInputValue);
        const matchesAlias = includesIgnoreCaseTrim(languageSearchResult.aliases || [], searchInputValue);

        return matchesName || matchesAlias;
    }


    /**
     * @param languages to map the name of
     * @returns string array with ```name```s of programming languages
     */
    function mapLanguageNames(languages: ProgrammingLanguage[]): string[] {

        return (languages || []).map(languageSearchResult => languageSearchResult.name);
    }


    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            verticalAlign="center"
            flexWrap={"nowrap"}
            ref={componentRef}
            {...otherProps}
        >
            {/* Search Language */}
            <SearchBar 
                className={"languageSearchBar " + (isShowNoteInputSettings ? "ms-3" : "")}
                placeHolder="Language..." 
                ref={languageSearchBarRef}
                title="Search programming language"
                defaultValue={noteInputEntity.programmingLanguage || ""}
                tabIndex={isShowNoteInputSettings ? undefined : -1}
                rendered={noteInputEntity.type !== "PLAIN_TEXT"}
                onFocus={handleLanguageSearchFocus}
                onBlur={handleLanguageSearchBlur}
                onKeyDown={handleLanguageSearchKeyDown}
                onKeyUp={handleLanguageSearchKeyUp}
                _focus={{borderColor: "var(--accentColor)"}}
                _searchIcon={{padding: "2px"}} 
            >
                <LanguageSearchResults 
                    rendered={showLanguageSearchResults} 
                    languageSearchResults={languageSearchResults}
                    handleSelect={handleSelectLanguage}
                    setShowLanguageSearchResults={() => setShowLanguageSearchResults(false)}
                />
            </SearchBar>

            {/* Programming Language button */}
            <Button 
                className="toggleLanguageSearchBarButton defaultNoteInputButton transition" 
                title="Programming Language"
                disabled={areNoteInputSettingsDisabled}
                onClick={() => toggleNoteInputSettings()}
            >
                {/* <i className="fa-solid fa-code dontSelectText"></i> */}
                <i className="fa-solid fa-globe"></i>
                {/* <i className="fa-solid fa-less-than"></i><i className="fa-solid fa-globe"></i><i className="fa-solid fa-greater-than"></i> */}
            </Button>
                
            {children}
        </Flex>
    )
}
