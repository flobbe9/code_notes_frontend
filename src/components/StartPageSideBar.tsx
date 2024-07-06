import React, { useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/StartPageSideBar.css";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Flex from "./helpers/Flex";
import SearchBar from "./helpers/SearchBar";
import { JQueryEasing } from "../abstract/CSSTypes";
import { getCssConstant, log } from "../helpers/utils";
import { AppContext } from "./App";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
// TODO: strg + b toggle
// IDEA: filter icon
export default function StartPageSideBar({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "StartPageSideBar", true);

    const tagFilterContainerRef = useRef(null);

    const { getDeviceWidth, isKeyPressed } = useContext(AppContext);


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);


    function slideInTagFilterContainer(duration = 400, easing: JQueryEasing = "easeOutSine"): void {

        const tagFilterContainer = $(tagFilterContainerRef.current!);

        tagFilterContainer.show();

        tagFilterContainer.animate(
            {
                width: getMaxWidth(), 
                paddingRight: getCssConstant("tagFilterContainerPadding"),
                paddingLeft: getCssConstant("tagFilterContainerPadding"),
            },
            duration,
            easing
        );
    }


    function slideOutTagFilterContainer(duration = 300, easing: JQueryEasing = "easeInSine"): void {

        const tagFilterContainer = $(tagFilterContainerRef.current!);

        tagFilterContainer.animate(
            {
                width: 0, 
                paddingRight: 0,
                paddingLeft: 0
            },
            duration,
            easing,
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

        if (isKeyPressed("Control") && keyName === "b")
            toggleTagFilterContainer();
    }


    return (
        <div 
            id={id} 
            className={className + " fullViewHeight me-2"}
            style={style}
        >
            <Flex className="fullHeight" flexWrap="nowrap">
                {/* Toolbar */}
                <div className="toolBar">
                    <i className="fa-solid fa-bars fa-xl hover" onClick={toggleTagFilterContainer}></i>
                </div>

                {/* Tag filter container */}
                <div className="tagFilterContainer hidden" ref={tagFilterContainerRef}>
                    <SearchBar 
                        placeHolder="Search tags..."
                        _focus={{borderColor: "orange"}} 
                        _searchIcon={{color: "var(--iconColor)"}}
                        _searchInput={{color: "white"}} 
                        _xIcon={{color: "var(--iconColor)"}}
                    />

                    <hr />

                    <div className="tagList">
                        <div>
                            Tag
                        </div>
                        <div>
                            Tag
                        </div>
                    </div>
                </div>
            </Flex>
                
            {children}
        </div>
    )
}