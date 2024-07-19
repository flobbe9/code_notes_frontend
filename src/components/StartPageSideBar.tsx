import React, { useContext, useEffect, useRef } from "react";
import "../assets/styles/StartPageSideBar.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Flex from "./helpers/Flex";
import SearchBar from "./helpers/SearchBar";
import { JQueryEasing } from "../abstract/CSSTypes";
import { getCssConstant, log } from "../helpers/utils";
import { AppContext } from "./App";
import StartPageSideBarTagList from "./StartPageSideBarTagList";
import { StartPageContext } from "./StartPageContainer";
import Button from "./helpers/Button";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
// IDEA: filter icon
export default function StartPageSideBar({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBar", true);

    const componentRef = useRef(null);
    const tagFilterContainerRef = useRef(null);

    const { getDeviceWidth, isKeyPressed } = useContext(AppContext);
    const { setStartPageSideBarWidth } = useContext(StartPageContext);


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        updateSideBarWidthState();

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);


    function slideInTagFilterContainer(duration = 100, easing: JQueryEasing = "easeOutSine"): void {

        const tagFilterContainer = $(tagFilterContainerRef.current!);

        tagFilterContainer.show();

        tagFilterContainer.animate(
            {
                width: getMaxWidth(), 
                paddingRight: getCssConstant("tagFilterContainerPadding"),
                paddingLeft: getCssConstant("tagFilterContainerPadding"),
            },
            duration,
            easing,
            // update sibarWidth
            () => updateSideBarWidthState()
        );
    }


    function slideOutTagFilterContainer(duration = 100, easing: JQueryEasing = "easeInSine"): void {

        const tagFilterContainer = $(tagFilterContainerRef.current!);

        tagFilterContainer.animate(
            {
                width: 0, 
                paddingRight: 0,
                paddingLeft: 0
            },
            duration,
            easing,
            () => {
                tagFilterContainer.hide();
                updateSideBarWidthState();
            }
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


    function updateSideBarWidthState(): void {

        setStartPageSideBarWidth($(componentRef.current!).outerWidth()?.toString())
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
                {/* Toolbar */}
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
                    {/* TODO: disable if no tags selected */}
                    {/* TODO: add functionality */}
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