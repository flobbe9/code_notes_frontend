import React, { useEffect, useState } from "react";
import "../assets/styles/StartPageContent.css";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import BlockContainer from "./block/BlockContainer";
import SearchBar from "./helpers/SearchBar";
import { log } from "../helpers/utils";


interface Props extends DefaultProps {

}


/**
 * Container for all content on start page that is not the side bar.
 * 
 * @since 0.0.1
 */
export default function StartPageContent({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "StartPageContent", true);

    return (
        <div 
            id={id} 
            className={className + " fullWidth"}
            style={style}
        >
            {/* Search bar */}
            <SearchBar placeHolder="Search notes..." className="m-3" _focus={{borderColor: "var(--accentColor)"}} />

            {/* List of blockContainers */}
            {testBlockContainers}

            {children}
        </div>
    )
}


const testBlockContainers = [
    <BlockContainer />
]