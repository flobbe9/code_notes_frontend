import $ from "jquery";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/StartPageSideBar.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Flex from "./helpers/Flex";
import SearchBar from "./helpers/SearchBar";
import { getCssConstant } from "../helpers/utils";
import { AppContext } from "./App";
import StartPageSideBarTagList from "./StartPageSideBarTagList";
import { StartPageContainerContext } from "./StartPageContainer";
import Button from "./helpers/Button";
import { BLOCK_SETTINGS_ANIMATION_DURATION } from "../helpers/constants";
import { AppFetchContext } from "./AppFetchContextHolder";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
// IDEA: filter icon
// TODO: 
    // consider heading like "Filter by tag", remove hr
    // give tags differen border radius?
export default function StartPageSideBar({...props}: Props) {

    /** Tag search value eagerly updated on change event */
    const [searchValue, setSearchValue] = useState("");

    /** Refers to ```selectedTagEntityNames``` beeing not empty */
    const [anyTagsSelected, setAnyTagsSelected] = useState(false);

    const { getDeviceWidth, isKeyPressed } = useContext(AppContext);
    const { appUserEntity, noteEntities } = useContext(AppFetchContext);
    const { setIsShowSideBar, setSelectedTagEntityNames, selectedTagEntityNames } = useContext(StartPageContainerContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBar", true);

    const componentRef = useRef(null);
    const tagFilterContainerRef = useRef(null);
    const searchBarRef = useRef(null);

    const context = {
        searchValue
    }


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);


    useEffect(() => {
        setAnyTagsSelected(!!selectedTagEntityNames.size)

    }, [selectedTagEntityNames]);


    function slideInTagFilterContainer(): void {

        setIsShowSideBar(true);

        const tagFilterContainer = $(tagFilterContainerRef.current!);

        tagFilterContainer.show();

        tagFilterContainer.animate(
            {
                width: getMaxWidth(), 
                paddingRight: getCssConstant("tagFilterContainerPadding"),
                paddingLeft: getCssConstant("tagFilterContainerPadding"),
            },
            BLOCK_SETTINGS_ANIMATION_DURATION,
            "easeOutSine",
        );
    }


    function slideOutTagFilterContainer(): void {

        setIsShowSideBar(false);

        const tagFilterContainer = $(tagFilterContainerRef.current!);

        tagFilterContainer.animate(
            {
                width: 0, 
                paddingRight: 0,
                paddingLeft: 0
            },
            BLOCK_SETTINGS_ANIMATION_DURATION,
            "easeInSine",
            () => tagFilterContainer.hide()
        );
    }


    function toggleTagFilterContainer(): void {

        const tagFilterContainer = $(tagFilterContainerRef.current!);

        if (tagFilterContainer.is(":visible"))
            slideOutTagFilterContainer();
        else
            slideInTagFilterContainer();
    }


    function getMaxWidth(): string {

        return getDeviceWidth().isMobileWidth ? getCssConstant("startPageSideBarWidthWidthMobile") : getCssConstant("startPageSideBarWidth");
    }


    function handleKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "Escape")
            slideOutTagFilterContainer();

        if (isKeyPressed("Control") && keyName === "b") {
            event.preventDefault();
            toggleTagFilterContainer();
        }
    }


    function handleSearchBarChange(event): void {

        setSearchValue(event.target.value);
    }


    function handleSearchBarXIconClick(event): void {

        setSearchValue("");
    }


    function handleResetClick(event): void {

        setSelectedTagEntityNames(new Set());
        $(searchBarRef.current!).val("");
        setSearchValue("");
    }


    return (
        <StartPageSideBarContext.Provider value={context}>
            <div 
                id={id} 
                className={className}
                style={style}
                ref={componentRef}
                {...otherProps}
            >
                <Flex className="fullHeight" flexWrap="nowrap">
                    {/* Fixed sidebar part*/}
                    <div className="toolBar">
                        <Button className="toolBarToggleButton hover" onClick={toggleTagFilterContainer}>
                            <i className="fa-solid fa-bars fa-xl" title="Side bar (Ctrl + B)"></i>
                        </Button>
                    </div>

                    {/* Expandable sidebar part */}
                    <div className="tagFilterContainer hidden" ref={tagFilterContainerRef}>
                        {/* SearchBar */}
                        <SearchBar 
                            placeHolder="Search tags..."
                            title="Search tags"
                            disabled={!noteEntities.length}
                            onChange={handleSearchBarChange}
                            onXIconClick={handleSearchBarXIconClick}
                            ref={searchBarRef}
                            _focus={{borderColor: "var(--accentColor)"}} 
                            _searchIcon={{color: "var(--iconColor)"}}
                            _searchInput={{color: "white"}} 
                            _xIcon={{color: "var(--iconColor)"}}
                        />

                        {/* Reset button */}
                        <Flex className="mt-3" horizontalAlign="right">
                            <Button 
                                className="resetButton hover" 
                                title="Reset tag filter" 
                                disabled={!anyTagsSelected}
                                onClick={handleResetClick} 
                            >
                                Reset   
                            </Button>
                        </Flex>

                        <hr />

                        {/* Tag checkboxes */}
                        <div className="startPageSideBarListContainer">
                            <StartPageSideBarTagList disabled={!noteEntities.length} />
                        </div>
                    </div>
                </Flex>
                    
                {children}
            </div>
        </StartPageSideBarContext.Provider>
    )
}


export const StartPageSideBarContext = createContext({
    searchValue: ""
})