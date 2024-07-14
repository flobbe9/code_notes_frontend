import React, { useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/StartPageContent.css";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import BlockContainer from "./block/BlockContainer";
import SearchBar from "./helpers/SearchBar";
import { getRandomString, log } from "../helpers/utils";
import { AppContext } from "./App";


interface Props extends DefaultProps {

}


/**
 * Container for all content on start page that is not the side bar.
 * 
 * @since 0.0.1
 */
export default function StartPageContent({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "StartPageContent", true);

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
        >
            {/* Search bar */}
            <SearchBar 
                className="m-3" 
                placeHolder="Search Title, tag, note text..." 
                title="Search notes (Ctrl+Shift+F)"
                ref={searchInputRef}
                _focus={{borderColor: "var(--accentColor)"}}
            />

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