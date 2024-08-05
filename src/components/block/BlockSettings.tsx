import React, { useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/BlockSettings.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import SearchBar from "../helpers/SearchBar";
import LanguageSearchResults from "../LanguageSearchResults";
import BlockSwitch from "./BlockSwitch";
import { getCssConstant, getCSSValueAsNumber, includesIgnoreCase, includesIgnoreCaseTrim, isEmpty, isEventKeyTakingUpSpace, log } from "../../helpers/utils";
import { AppContext } from "../App";
import { BLOCK_SETTINGS_ANIMATION_DURATION, CODE_BLOCK_LANGUAGES, CODE_BLOCK_WITH_VARIABLES_LANGUAGES } from "../../helpers/constants";
import { DefaultBlockContext } from "./DefaultBlock";
import { NoteInput } from "../../abstract/entites/NoteInput";
import { NoteInputType } from "../../abstract/NoteInputType";
import { ProgrammingLanguage } from "../../abstract/ProgrammingLanguage";


interface Props extends DefaultProps {

    /** Applies to the toggle button. Default should be ```false``` */
    areBlockSettingsDisabled: boolean,

    noteInput: NoteInput
}


/**
 * Component containing the language searchbar and block switch for one block.
 * 
 * @since 0.0.1
 */
export default function BlockSettings({noteInput, areBlockSettingsDisabled, ...props}: Props) {
    
    const [showLanguageSearchResults, setShowLanguageSearchResults] = useState(false);
    
    /** List of all possible results */
    const [allLanguageSearchResults, setAllLanguageResults] = useState<ProgrammingLanguage[]>([]);
    /** List of results after searching. Init value is all results */
    const [languageSearchResults, setLanguageSearchResults] = useState<string[]>(mapLanguageNames(allLanguageSearchResults));

    const { 
        isShowBlockSettings, 
        setIsShowBlockSettings,

        setCodeBlockLanguage,
        setCodeBlockcodeBlockWithVariablesLanguage
        
    } = useContext(DefaultBlockContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "BlockSettings");

    const componentRef = useRef(null);
    const blockSwitchRef = useRef(null);
    const languageSearchBarRef = useRef(null);

    // IDEA: make custom colors and pass them to buttons as border color

    const { getDeviceWidth } = useContext(AppContext);
    const { isTabletWidth } = getDeviceWidth();


    useEffect(() => {
        const allLanguageSearchResults = getAllLanguagesByBlockType();

        setAllLanguageResults(allLanguageSearchResults);
        setLanguageSearchResults(mapLanguageNames(allLanguageSearchResults));

    }, []);


    /**
     * Slide toggle the block switch.
     * 
     * @param hide whether to hide the block switch regardles of it's current state
     */
    function toggleBlockSwitch(hide = isShowBlockSettings): void {

        const blockSwitch = $(blockSwitchRef.current!);

        // case: show block settings
        if (!hide)
            // radio buttons back to static
            blockSwitch.children(".RadioButton").css("position", "static");

        // fake "toggle slide"
        blockSwitch.animate(
            {
                width: hide ? 0 : getCssConstant("blockSwitchWidth"),
                opacity: hide ? 0 : 1,
                zIndex: hide ? -1 : 0
            }, 
            BLOCK_SETTINGS_ANIMATION_DURATION,
            "swing",
            // radio buttons to absolute so they dont widen the container width
            () => blockSwitch.children(".RadioButton").css("position", (hide ? "absolute" : "static"))
        )
    }


    /**
     * Slide toggle the language searchbar.
     * 
     * @param hide whether to hide the searchbar regardles of it's current state
     */
    function toggleLanguageSearchBar(hide = isShowBlockSettings): void {

        const languageSearchBar = $(componentRef.current!).find(".languageSearchBar");
        const languageSearchBarWidth = getCSSValueAsNumber(getCssConstant("languageSearchBarWidth"), 2);

        if (!hide)
            languageSearchBar.css("position", "relative");

        // fake "toggle slide"
        languageSearchBar.animate(
            {
                width: hide ? 0 : languageSearchBarWidth,
                opacity: hide ? 0 : 1,
                zIndex: hide ? -1 : 1
            }, 
            BLOCK_SETTINGS_ANIMATION_DURATION,
            "swing",
            () => languageSearchBar.css("position", (hide ? "absolute" : "relative"))
        )
    }


    /**
     * Slide toggle this component except the toggle button.
     * 
     * @param hide whether to hide the block settings regardles of their current state
     */
    function toggleBlockSettings(hide = isShowBlockSettings): void {

        setIsShowBlockSettings(!hide);

        toggleBlockSwitch(hide);
        toggleLanguageSearchBar(hide);
    }


    function handleLanguageSearchKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "ArrowDown") {
            event.preventDefault();

            const firstLanguageSearchResult = $(componentRef.current!).find(".LanguageSearchResults input").first();
            firstLanguageSearchResult.trigger("focus");
            
            setShowLanguageSearchResults(true);
        
        } else if (keyName === "Escape") {
            $(languageSearchBarRef.current!).trigger("blur");
            setShowLanguageSearchResults(false);

        } else if (keyName === "Tab")
            setShowLanguageSearchResults(false);
    }
    
    
    function handleLanguageSearchFocus(event): void {
        
        setShowLanguageSearchResults(true);
    }
    
    
    function handleLanguageSearchBlur(event): void {

        setShowLanguageSearchResults(false);
    }


    function handleSelectLanguage(language: string): void {

        // update language state
        if (noteInput.type === NoteInputType.CODE)
            setCodeBlockLanguage(language);

        else if (noteInput.type === NoteInputType.CODE_WITH_VARIABLES)
            setCodeBlockcodeBlockWithVariablesLanguage(language);

        // hide result box
        setShowLanguageSearchResults(false);

        // hide settings
        toggleBlockSettings(true);

        // set searchbar value to selected language
        $(languageSearchBarRef.current!).prop("value", language);
    }


    function handleLanguageSearchKeyUp(event): void {

        const keyName = event.key;
        
        if (keyName === " ") 
            event.preventDefault();

        else if (isEventKeyTakingUpSpace(keyName, false) || keyName === "Backspace")
            handleLanguageSearch(event);
    }


    function handleLanguageSearch(event): void {

        const currentSearchInputValue: string = $(languageSearchBarRef.current!).prop("value");

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
     * @returns the complete list of available programming languages for current block type
     */
    function getAllLanguagesByBlockType(): ProgrammingLanguage[] {

        if (noteInput.type === NoteInputType.CODE)
            return CODE_BLOCK_LANGUAGES;

        if (noteInput.type === NoteInputType.CODE_WITH_VARIABLES)
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
            verticalAlign="start"
            horizontalAlign={isTabletWidth ? "right" : "center"}
            // wrap for mobile view
            flexWrap={isTabletWidth && isShowBlockSettings ? "wrap" : "nowrap"}
            ref={componentRef}
            {...otherProps}
        >
            <BlockSwitch className="" ref={blockSwitchRef} tabIndex={isShowBlockSettings ? 0 : -1} />

            {/* Search Language */}
            <SearchBar 
                className={"languageSearchBar " + (isShowBlockSettings ? "ms-1 me-1" : "")}
                placeHolder="Language..." 
                ref={languageSearchBarRef}
                title="Search programming language"
                tabIndex={isShowBlockSettings ? undefined : -1}
                rendered={noteInput.type !== NoteInputType.PLAIN_TEXT}
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

            {/* Toggle button */}
            <Button 
                className="toggleBlockSettingsButton transition ms-1" 
                style={{backgroundColor: isShowBlockSettings ? "var(--codeGrey)" : "transparent"}}
                title="Section settings"
                disabled={areBlockSettingsDisabled}
                onClick={() => toggleBlockSettings()}
                _hover={isShowBlockSettings ? {} : {backgroundColor: "buttonFace"}}
            >
                <i className="fa-solid fa-ellipsis-vertical dontSelectText"></i>
            </Button>
                
            {children}
        </Flex>
    )
}