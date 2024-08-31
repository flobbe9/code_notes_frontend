import React, { useContext, useEffect, useRef } from "react";
import "../assets/styles/StartPageSideBar.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Flex from "./helpers/Flex";
import SearchBar from "./helpers/SearchBar";
import { JQueryEasing } from "../abstract/CSSTypes";
import { getCssConstant, log } from "../helpers/utils";
import { AppContext } from "./App";
import StartPageSideBarTagList from "./StartPageSideBarTagList";
import { StartPageContainerContext } from "./StartPageContainer";
import Button from "./helpers/Button";
import { BLOCK_SETTINGS_ANIMATION_DURATION } from "../helpers/constants";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
// IDEA: filter icon
// TODO: 
    // consider heading like "Filter by tag", remove hr
export default function StartPageSideBar({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBar", true);

    const componentRef = useRef(null);
    const tagFilterContainerRef = useRef(null);

    const { getDeviceWidth, isKeyPressed } = useContext(AppContext);
    const { setIsShowSideBar } = useContext(StartPageContainerContext);


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);


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


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            ref={componentRef}
            {...otherProps}
        >
            <Flex className="fullHeight" flexWrap="nowrap">
                {/* Toolbar button */}
                <div className="toolBar">
                    <Button className="toolBarToggleButton hover" onClick={toggleTagFilterContainer}>
                        <i className="fa-solid fa-bars fa-xl" title="Side bar (Ctrl + B)"></i>
                    </Button>
                </div>

                {/* Tag filter container */}
                <div className="tagFilterContainer hidden" ref={tagFilterContainerRef}>
                    <SearchBar 
                        placeHolder="Search tags..."
                        title="Search tags"
                        _focus={{borderColor: "var(--accentColor)"}} 
                        _searchIcon={{color: "var(--iconColor)"}}
                        _searchInput={{color: "white"}} 
                        _xIcon={{color: "var(--iconColor)"}}
                    />

                    {/* Reset tag filters */}
                    <Flex className="mt-3" horizontalAlign="right">
                        <Button className="resetButton hover" title="Reset tag filter">
                            Reset   
                        </Button>
                    </Flex>

                    <hr />

                    <StartPageSideBarTagList />
                </div>
            </Flex>
                
            {children}
        </div>
    )
}