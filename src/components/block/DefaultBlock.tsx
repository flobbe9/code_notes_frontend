import React, { useEffect, useRef, useState } from "react";
import "../../assets/styles/DefaultBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import BlockSwitch from "./BlockSwitch";
import SearchBar from "../helpers/SearchBar";
import LanguageSearchResults from "../LanguageSearchResults";
import { log } from "../../helpers/utils";


interface Props extends DefaultProps {

}


/**
 * Parent component for any block component. Defines some default behaviour and styling for all blocks.
 * 
 * Is referred to as "Section" for the user.
 *  
 * @since 0.0.1
 */
export default function DefaultBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultBlock");

    const componentRef = useRef(null);
    const blockSwitchRef = useRef(null);
    const languageSearchBarRef = useRef(null);

    // IDEA: make custom colors and pass them to buttons as border color

    const [isShowBlockSettings, setIsShowBlockSettings] = useState(false);


    function toggleBlockSwitch(): void {

        const blockSwitch = $(blockSwitchRef.current!);

        // case: show block settings
        if (!isShowBlockSettings)
            // radio buttons back to static
            blockSwitch.children(".RadioButton").css("position", "static");

        // fake "toggle slide"
        blockSwitch.animate(
            {
                width: isShowBlockSettings ? 0 : "136px",
                opacity: isShowBlockSettings ? 0 : 1,
                zIndex: isShowBlockSettings ? -1 : 0
            }, 
            300,
            "swing",
            // radio buttons to absolute so they dont widen the container width
            () => blockSwitch.children(".RadioButton").css("position", (isShowBlockSettings ? "absolute" : "static"))
        )
    }


    function toggleLanguageSearchBar(): void {

        const languageSearchBar = $(componentRef.current!).find(".languageSearchBar");

        // fake "toggle slide"
        languageSearchBar.animate(
            {
                // TODO: make 150 a css variable and replace in language search results
                width: isShowBlockSettings ? 0 : "150px",
                opacity: isShowBlockSettings ? 0 : 1,
                zIndex: isShowBlockSettings ? -1 : 0
            }, 
            300,
            "swing"
        )
    }


    function toggleBlockSettings(): void {

        setIsShowBlockSettings(!isShowBlockSettings);

        toggleBlockSwitch();
        toggleLanguageSearchBar();
    }


    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            flexWrap="nowrap"
            verticalAlign="start"
            ref={componentRef}
            {...otherProps}
        >
            <Flex className="blockContent fullWidth" flexWrap="nowrap">
                {/* Block */}
                <div className="defaultBlockChildren fullWidth">
                    {children}
                </div>

                {/* Delete button */}
                <Button className="deleteBlockButton defaultBlockButton hover" title="Delete section">
                    <i className="fa-solid fa-xmark"></i>
                </Button>
            </Flex>

            <Flex className="blockSettings" flexWrap="nowrap" verticalAlign="start">
                {/* Block switch */}
                <BlockSwitch ref={blockSwitchRef} tabIndex={isShowBlockSettings ? 0 : -1} />

                {/* Search Language */}
                {/* TODO: hide this for plain text block */}
                {/* TODO: hide x icon button (tab) */}
                <SearchBar 
                    className={"languageSearchBar " + (isShowBlockSettings ? "ms-1 me-1" : "")}
                    placeHolder="Language..." 
                    ref={languageSearchBarRef}
                    _focus={{borderColor: "var(--accentColor)"}}
                    _xIcon={{display: "none"}} 
                    _searchIcon={{padding: "2px"}} 
                >
                    <LanguageSearchResults />
                </SearchBar>

                {/* Toggle block switch */}
                <Button 
                    className="toggleBlockSettingsButton transition" 
                    style={{backgroundColor: isShowBlockSettings ? "var(--codeGrey)" : "transparent"}}
                    title="Section settings"
                    onClick={toggleBlockSettings}
                    _hover={isShowBlockSettings ? {} : {backgroundColor: "buttonFace"}}
                >
                    <i className="fa-solid fa-ellipsis-vertical dontSelectText"></i>
                </Button>
            </Flex>
        </Flex>
    )
}