import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/DefaultBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import { getJsxElementIndexByKey, log } from "../../helpers/utils";
import BlockSettings from "./BlockSettings";
import { NoteInput } from "../../abstract/entites/NoteInput";
import Overlay from "../helpers/Overlay";
import { CODE_BLOCK_DEFAULT_LANGUAGE, CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE } from "../../helpers/constants";
import { BlockContainerContext } from "./BlockContainer";
import { AppContext } from "../App";


interface Props extends DefaultProps {

    noteInput: NoteInput,

    propsKey: string
}


/**
 * Parent component for any block component. Defines some default behaviour and styling for all blocks.
 * 
 * Is referred to as "Section" for the user.
 *  
 * @since 0.0.1
 */
export default function DefaultBlock({noteInput, propsKey, ...props}: Props) {

    const [isShowBlockSettings, setIsShowBlockSettings] = useState(false);
    const [areBlockSettingsDisabled, setAreBlockSettingsDisabled] = useState(false);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activateFullScreenStyles, setActivateFullScreenStyles] = useState<Function>(() => {});
    const [deactivateFullScreenStyles, setDeactivateFullScreenStyles] = useState<Function>(() => {});

    const [codeBlockLanguage, setCodeBlockLanguage] = useState(noteInput.programmingLanguage || CODE_BLOCK_DEFAULT_LANGUAGE);
    const [codeBlockWithVariablesLanguage, setCodeBlockcodeBlockWithVariablesLanguage] = useState(noteInput.programmingLanguage || CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE);

    const [blockOverlayVisible, setBlockOverlayVisible] = useState(false);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultBlock");

    const componentRef = useRef(null);

    const {
        toggleAppOverlay, 
        isAppOverlayVisible, 
    } = useContext(AppContext);

    const { note, blocks, setBlocks } = useContext(BlockContainerContext);

    const context = {
        isShowBlockSettings, 
        setIsShowBlockSettings,
        areBlockSettingsDisabled,
        setAreBlockSettingsDisabled,

        codeBlockLanguage, 
        setCodeBlockLanguage,

        codeBlockWithVariablesLanguage, 
        setCodeBlockcodeBlockWithVariablesLanguage,

        blockOverlayVisible,
        setBlockOverlayVisible,

        animateCopyIcon,

        isFullScreen,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen
    }


    useEffect(() => {
        $(window).on("keydown", handleGlobalKeyDown);

        return () => {
            $(window).off("keydown", handleGlobalKeyDown);
        }

    }, [isFullScreen, isAppOverlayVisible]);


    useEffect(() => {
        // deactivate full screen on overlay click
        if (!isAppOverlayVisible && isFullScreen) 
            deactivateFullScreen();

    }, [isAppOverlayVisible]);


    function handleDeleteNote(event): void {

        // TODO: confirm

        deleteNote();
    }



    function deleteNote(): void {

        const noteInputIndex = getJsxElementIndexByKey(blocks, propsKey);

        // update app user
        note.noteInputs?.splice(noteInputIndex, 1);

        // update noteInputs
        const newNoteInputs = blocks;
        newNoteInputs.splice(noteInputIndex, 1);
        setBlocks([...newNoteInputs]);
    }


    /**
     * Animate the icon of the "copy" button.
     */
    function animateCopyIcon(): void {

        const copyIcon = $(componentRef.current!).find(".copyButton .fa-copy").first();

        copyIcon.animate(
            {
                opacity: 0,
                fontSize: "3em"
            },
            400,
            "easeOutSine",
            () => {
                copyIcon.css("opacity", 1);
                copyIcon.css("fontSize", "1em");
            }
        );
    } 


    function toggleFullScreen(event): void {

        if (isFullScreen)
            deactivateFullScreen();
        else
            activateFullscreen();
    }


    function activateFullscreen(): void {

        activateFullScreenStyles();

        setIsFullScreen(true);

        toggleAppOverlay();
    }


    function deactivateFullScreen() {

        deactivateFullScreenStyles();

        setIsFullScreen(false);

        if (isAppOverlayVisible)
            toggleAppOverlay();
    }

    
    function handleGlobalKeyDown(event): void {

        const keyName = event.key;

        if (keyName === "Escape") 
            handleEscape(event);
    }


    function handleEscape(event): void {

        if (isFullScreen)
            deactivateFullScreen();
    }


    return (
        <DefaultBlockContext.Provider value={context}>
            <Flex 
                id={id} 
                className={className}
                style={style}
                flexWrap="nowrap"
                verticalAlign="start"
                horizontalAlign="center"
                ref={componentRef}
                {...otherProps}
            >
                <Flex className="blockContent fullWidth" flexWrap="nowrap" verticalAlign="start">
                    {/* Block */}
                    <div className="defaultBlockChildren fullWidth">
                        {children}
                    </div>

                    {/* Delete button */}
                    <Button 
                        className="deleteNoteButton defaultBlockButton" 
                        title="Delete section"
                        onClick={handleDeleteNote}
                    >
                        <i className="fa-solid fa-xmark fa-lg"></i>
                        {/* <i className="fa-solid fa-trash"></i> */}
                    </Button>
                </Flex>

                {/* Overlay */}
                <Overlay 
                    className="blockOverlay flexCenter" 
                    hideOnClick={false}
                    fadeInDuration={0}
                    isOverlayVisible={blockOverlayVisible} 
                    setIsOverlayVisible={setBlockOverlayVisible}
                >
                    <i className={"fa-solid fa-circle-notch rotating"}></i>
                </Overlay>
            </Flex>

        </DefaultBlockContext.Provider>
    )
}


export const DefaultBlockContext = createContext({
    isShowBlockSettings: false,
    setIsShowBlockSettings: (isShow: boolean) => {},
    areBlockSettingsDisabled: false,
    setAreBlockSettingsDisabled: (areDisabled: boolean) => {},

    codeBlockLanguage: "",
    setCodeBlockLanguage: (language: string) => {},

    codeBlockWithVariablesLanguage: "", 
    setCodeBlockcodeBlockWithVariablesLanguage: (language: string) => {},

    blockOverlayVisible: false,
    setBlockOverlayVisible: (isVisible: boolean) => {},

    animateCopyIcon: () => {},

    isFullScreen: false as boolean,
    setActivateFullScreenStyles: ({} as Function),
    setDeactivateFullScreenStyles: ({} as Function),
    toggleFullScreen: (event) => {}
});