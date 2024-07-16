import React, { useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/StartPageContent.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import BlockContainer from "./block/BlockContainer";
import SearchBar from "./helpers/SearchBar";
import { getRandomString, log } from "../helpers/utils";
import { AppContext } from "./App";
import ButtonSlideLabel from "./helpers/ButtonSlideLabel";
import Flex from "./helpers/Flex";
import Button from "./helpers/Button";


interface Props extends DefaultProps {

}


/**
 * Container for all content on start page that is not the side bar.
 * 
 * @since 0.0.1
 */
export default function StartPageContent({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageContent", true);

    const { isKeyPressed } = useContext(AppContext);

    const searchInputRef = useRef(null);


    useEffect(() => {
        $(window).on("keydown", handleKeyDown);

        return () => {
            $(window).off("keydown", handleKeyDown);
        }
    }, []);


    function handleKeyDown(event): void {

        // focus search input on Strg + Shift + F
        if (isKeyPressed("Control") && isKeyPressed("Shift") && event.key === "F") {
            event.preventDefault();
            $(searchInputRef.current!).trigger("focus");
        }
    }

    
    return (
        <div 
            id={id} 
            className={className + " fullWidth"}
            style={style}
            {...otherProps}
        >
            <Flex className="mb-3" flexWrap="nowrap" verticalAlign="center">
                {/* Search bar */}
                <SearchBar 
                    className="m-3 fullWidth" 
                    placeHolder="Search Title, tag, note text..." 
                    title="Search notes (Ctrl+Shift+F)"
                    ref={searchInputRef}
                    _focus={{borderColor: "var(--accentColor)"}}
                />

                {/* Add block container */}
                <Button className="addBlockContainerButton hover">
                    <i className="fa-solid fa-plus me-1"></i>
                    <span>New Note</span>
                </Button>
            </Flex>

            {/* List of blockContainers */}
            {testBlockContainers}

            {children}
        </div>
    )
}


const testBlockContainers = [
    <BlockContainer key={getRandomString()} />,
    <BlockContainer key={getRandomString()} />
]