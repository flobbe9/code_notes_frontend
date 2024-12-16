import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import "../assets/styles/StartPageSideBar.scss";
import { BLOCK_SETTINGS_ANIMATION_DURATION } from "../helpers/constants";
import { animateAndCommit, getCssConstant } from "../helpers/utils";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import { StartPageContainerContext } from "./StartPageContainer";
import StartPageSideBarTagList from "./StartPageSideBarTagList";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import SearchBar from "./helpers/SearchBar";


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

    const { isKeyPressed, isMobileWidth } = useContext(AppContext);
    const { appUserEntity } = useContext(AppFetchContext);
    const { setIsShowSideBar, setSelectedTagEntityNames, selectedTagEntityNames } = useContext(StartPageContainerContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBar", true);

    const componentRef = useRef(null);
    const tagFilterContainerRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLInputElement>(null);

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


    function slideRightTagFilterContainer(): void {

        setIsShowSideBar(true);

        const tagFilterContainer = tagFilterContainerRef.current!;

        tagFilterContainer.style.display = "block";

        animateAndCommit(tagFilterContainer, 
            {
                width: getMaxWidth(), 
                paddingRight: getCssConstant("tagFilterContainerPadding"),
                paddingLeft: getCssConstant("tagFilterContainerPadding"),
            },
            { 
                duration: BLOCK_SETTINGS_ANIMATION_DURATION,
                easing: "ease-out",
            }
        );
    }


    function slideLeftTagFilterContainer(): void {

        setIsShowSideBar(false);

        const tagFilterContainer = tagFilterContainerRef.current!;

        animateAndCommit(
            tagFilterContainer,
            {
                width: 0, 
                paddingRight: 0,
                paddingLeft: 0
            },
            {
                duration: BLOCK_SETTINGS_ANIMATION_DURATION,
                easing: "ease-in"
            },
            () => tagFilterContainer.style.display = "none"
        );
    }


    function toggleTagFilterContainer(): void {

        const display = tagFilterContainerRef.current!.style.display;

        if (display === "block") 
            slideLeftTagFilterContainer();
        else
            slideRightTagFilterContainer();
    }


    function getMaxWidth(): string {

        return isMobileWidth ? getCssConstant("startPageSideBarWidthWidthMobile") : getCssConstant("startPageSideBarWidth");
    }


    function handleKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "Escape")
            slideLeftTagFilterContainer();

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
        searchBarRef.current!.value = "";
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
                            disabled={!appUserEntity.tags?.length}
                            ref={searchBarRef}
                            onChange={handleSearchBarChange}
                            onXIconClick={handleSearchBarXIconClick}
                            _focus={{borderColor: "var(--accentColor)"}} 
                            _searchIcon={{color: "var(--iconColor)"}}
                            _searchInput={{color: "white"}} 
                            _xIcon={{color: "var(--iconColor)"}}
                        />

                        {/* Reset button */}
                        {/* NOTE: don't use flex here */}
                        <div className="mt-3 textRight">
                            <Button 
                                className="resetButton hover" 
                                title="Reset tag filter" 
                                disabled={!anyTagsSelected}
                                onClick={handleResetClick} 
                            >
                                Reset   
                            </Button>
                        </div>

                        <hr />

                        {/* Tag checkboxes */}
                        <div className="startPageSideBarListContainer">
                            <StartPageSideBarTagList disabled={!appUserEntity.tags?.length} />
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