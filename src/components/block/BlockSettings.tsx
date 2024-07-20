import React, { useContext, useRef, useState } from "react";
import "../../assets/styles/BlockSettings.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import SearchBar from "../helpers/SearchBar";
import LanguageSearchResults from "../LanguageSearchResults";
import BlockSwitch from "./BlockSwitch";
import { getCssConstant, getCSSValueAsNumber, includesIgnoreCase, log } from "../../helpers/utils";
import { AppContext } from "../App";
import { BLOCK_SETTINGS_ANIMATION_DURATION, CODE_BLOCK_LANGUAGES } from "../../helpers/constants";
import { DefaultBlockContext } from "./DefaultBlock";


interface Props extends DefaultProps {

    /** Applies to the toggle button. Default should be ```false``` */
    areBlockSettingsDisabled: boolean
}


/**
 * @since 0.0.1
 */
export default function BlockSettings({areBlockSettingsDisabled, ...props}: Props) {
    
    const [areLanguageSearchResultsRendered, setAreLanguageSearchResultsRendered] = useState(false);

    const { 
        isShowBlockSettings, 
        setIsShowBlockSettings,

        setCodeBlockLanguage
        
    } = useContext(DefaultBlockContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "BlockSettings");

    const componentRef = useRef(null);
    const blockSwitchRef = useRef(null);
    const languageSearchBarRef = useRef(null);

    // IDEA: make custom colors and pass them to buttons as border color

    const { getDeviceWidth } = useContext(AppContext);
    const { isTabletWidth } = getDeviceWidth();


    function toggleBlockSwitch(): void {

        const blockSwitch = $(blockSwitchRef.current!);

        // case: show block settings
        if (!isShowBlockSettings)
            // radio buttons back to static
            blockSwitch.children(".RadioButton").css("position", "static");

        // fake "toggle slide"
        blockSwitch.animate(
            {
                width: isShowBlockSettings ? 0 : getCssConstant("blockSwitchWidth"),
                opacity: isShowBlockSettings ? 0 : 1,
                zIndex: isShowBlockSettings ? -1 : 0
            }, 
            BLOCK_SETTINGS_ANIMATION_DURATION,
            "swing",
            // radio buttons to absolute so they dont widen the container width
            () => blockSwitch.children(".RadioButton").css("position", (isShowBlockSettings ? "absolute" : "static"))
        )
    }


    function toggleLanguageSearchBar(): void {

        const languageSearchBar = $(componentRef.current!).find(".languageSearchBar");
        const languageSearchBarWidth = getCSSValueAsNumber(getCssConstant("languageSearchBarWidth"), 2);

        // fake "toggle slide"
        languageSearchBar.animate(
            {
                width: isShowBlockSettings ? 0 : languageSearchBarWidth,
                opacity: isShowBlockSettings ? 0 : 1,
                zIndex: isShowBlockSettings ? -1 : 1
            }, 
            BLOCK_SETTINGS_ANIMATION_DURATION,
            "swing"
        )
    }


    function toggleBlockSettings(): void {

        setIsShowBlockSettings(!isShowBlockSettings);

        toggleBlockSwitch();
        toggleLanguageSearchBar();
    }


    function handleLanguageSearchKeyDown(event): void {

        const keyName = event.key;

        // TODO: does not work anymore
        if (keyName === "ArrowDown") {
            event.preventDefault();

            const firstSearchResult = $(componentRef.current!).find(".LanguageSearchResults input").first();
            firstSearchResult.trigger("focus");
            setAreLanguageSearchResultsRendered(true);
        
        } else if (keyName === "Escape")
            $(languageSearchBarRef.current!).trigger("blur");

        // TODO: update search results
            // do something like "no match" if no results
            // sort alphabetically
    }
    
    
    function handleLanguageSearchFocus(event): void {
        
        setAreLanguageSearchResultsRendered(true);
    }
    
    
    function handleLanguageSearchBlur(event): void {

        if (!includesIgnoreCase(event.target.className, "searchInput")) 
            setAreLanguageSearchResultsRendered(false);
    }


    function handleLanguageSearchResultsFocusOut(event): void {

        setAreLanguageSearchResultsRendered(false);
    }


    function handleSelectLanguage(language: string): void {

        // if is code block
        setCodeBlockLanguage(language);

        // else if is code block with variables
        // TODO
        
        setAreLanguageSearchResultsRendered(false);

        // TOOD: consider closing settings or making selection the search bar value
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
            {/* TODO: hide this for plain text block */}
            <SearchBar 
                className={"languageSearchBar " + (isShowBlockSettings ? "ms-1 me-1" : "")}
                placeHolder="Language..." 
                ref={languageSearchBarRef}
                title="Search programming language"
                tabIndex={isShowBlockSettings ? 0 : -1}
                onFocus={handleLanguageSearchFocus}
                onBlur={handleLanguageSearchBlur}
                onKeyDown={handleLanguageSearchKeyDown}
                _focus={{borderColor: "var(--accentColor)"}}
                _searchIcon={{padding: "2px"}} 
            >
                <LanguageSearchResults 
                    rendered={areLanguageSearchResultsRendered} 
                    possibleSearchResults={CODE_BLOCK_LANGUAGES}
                    handleSelect={handleSelectLanguage}
                    onBlur={handleLanguageSearchResultsFocusOut}
                />
            </SearchBar>

            {/* Toggle button */}
            <Button 
                className="toggleBlockSettingsButton transition" 
                style={{backgroundColor: isShowBlockSettings ? "var(--codeGrey)" : "transparent"}}
                title="Section settings"
                disabled={areBlockSettingsDisabled}
                onClick={toggleBlockSettings}
                _hover={isShowBlockSettings ? {} : {backgroundColor: "buttonFace"}}
            >
                <i className="fa-solid fa-ellipsis-vertical dontSelectText"></i>
            </Button>
                
            {children}
        </Flex>
    )
}