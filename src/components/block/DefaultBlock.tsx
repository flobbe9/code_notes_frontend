import React, { useRef, useState } from "react";
import "../../assets/styles/DefaultBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import BlockSwitch from "./BlockSwitch";
import SearchBar from "../helpers/SearchBar";


interface Props extends DefaultProps {

}


/**
 * Parent component for any block component. Defines some default behaviour and styling for all blocks.
 * 
 * Is referred to as "Section" for the user.
 *  
 * @since 0.0.1
 */
export default function DefaultBlock({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "DefaultBlock");

    const componentRef = useRef(null);
    const blockSwitchRef = useRef(null);
    const languageSearchBarRef = useRef(null);

    // IDEA: make custom colors and pass them to buttons as border color

    const [isShowBlockSettings, setIsShowBlockSettings] = useState(false);


    function toggleBlockSwitch(): void {

        const blockSwitch = $(blockSwitchRef.current!);

        // case: show block switch
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
                {/* TODO: add drop down */}
                <SearchBar 
                    className={"languageSearchBar " + (isShowBlockSettings ? "ms-1 me-1" : "")}
                    placeHolder="Language..." 
                    ref={languageSearchBarRef}
                    _xIcon={{display: "none"}} 
                    _searchIcon={{padding: "2px"}} 
                />

                {/* Toggle block switch */}
                <Button 
                    className="toggleBlockSettingsButton transition" 
                    style={{backgroundColor: isShowBlockSettings ? "var(--codeGrey)" : "transparent"}}
                    title="Section settings"
                    onClick={toggleBlockSettings}
                    _hover={isShowBlockSettings ? {} : {backgroundColor: "buttonFace"}}
                >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </Button>
            </Flex>
        </Flex>
    )
}