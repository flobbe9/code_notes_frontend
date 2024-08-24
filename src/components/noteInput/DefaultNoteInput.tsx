import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/DefaultNoteInput.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import { getJsxElementIndexByKey, log } from "../../helpers/utils";
import NoteInputSettings from "./NoteInputSettings";
import { NoteInputEntity } from "../../abstract/entites/NoteInputEntity";
import Overlay from "../helpers/Overlay";
import { CODE_BLOCK_DEFAULT_LANGUAGE, CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE } from "../../helpers/constants";
import { NoteContext } from "./Note";
import { AppContext } from "../App";


interface Props extends DefaultProps {

    noteInputEntity: NoteInputEntity,

    propsKey: string
}


/**
 * Parent component for any noteInput component. Defines some default behaviour and styling for all noteInputs.
 * 
 * Is referred to as "Section" for the user.
 *  
 * @since 0.0.1
 */
export default function DefaultNoteInput({noteInputEntity, propsKey, ...props}: Props) {

    const [isShowNoteInputSettings, setIsShowNoteInputSettings] = useState(false);
    const [areNoteInputSettingsDisabled, setAreNoteInputSettingsDisabled] = useState(false);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activateFullScreenStyles, setActivateFullScreenStyles] = useState<Function>(() => {});
    const [deactivateFullScreenStyles, setDeactivateFullScreenStyles] = useState<Function>(() => {});

    const [codeNoteInputLanguage, setCodeNoteInputLanguage] = useState(noteInputEntity.programmingLanguage || CODE_BLOCK_DEFAULT_LANGUAGE);
    const [codeNoteInputWithVariablesLanguage, setCodeNoteInputcodeNoteInputWithVariablesLanguage] = useState(noteInputEntity.programmingLanguage || CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE);

    const [noteInputOverlayVisible, setNoteInputOverlayVisible] = useState(false);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultNoteInput");

    const componentRef = useRef(null);

    const {
        toggleAppOverlay, 
        isAppOverlayVisible, 
    } = useContext(AppContext);

    const { note, noteInputs, setNoteInputs } = useContext(NoteContext);

    const context = {
        isShowNoteInputSettings, 
        setIsShowNoteInputSettings,
        areNoteInputSettingsDisabled,
        setAreNoteInputSettingsDisabled,

        codeNoteInputLanguage, 
        setCodeNoteInputLanguage,

        codeNoteInputWithVariablesLanguage, 
        setCodeNoteInputcodeNoteInputWithVariablesLanguage,

        noteInputOverlayVisible,
        setNoteInputOverlayVisible,

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

        const noteInputEntityIndex = getJsxElementIndexByKey(noteInputs, propsKey);

        // update app user
        note.noteInputEntitys?.splice(noteInputEntityIndex, 1);

        // update noteInputEntitys
        const newNoteInputEntitys = noteInputs;
        newNoteInputEntitys.splice(noteInputEntityIndex, 1);
        setNoteInputs([...newNoteInputEntitys]);
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
        <DefaultNoteInputContext.Provider value={context}>
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
                <Flex className="noteInputContent fullWidth" flexWrap="nowrap" verticalAlign="start">
                    {/* NoteInput */}
                    <div className="defaultNoteInputChildren fullWidth">
                        {children}
                    </div>

                    {/* Delete button */}
                    <Button 
                        className="deleteNoteButton defaultNoteInputButton" 
                        title="Delete section"
                        onClick={handleDeleteNote}
                    >
                        <i className="fa-solid fa-xmark fa-lg"></i>
                        {/* <i className="fa-solid fa-trash"></i> */}
                    </Button>
                </Flex>

                {/* Overlay */}
                <Overlay 
                    className="noteInputOverlay flexCenter" 
                    hideOnClick={false}
                    fadeInDuration={0}
                    isOverlayVisible={noteInputOverlayVisible} 
                    setIsOverlayVisible={setNoteInputOverlayVisible}
                >
                    <i className={"fa-solid fa-circle-notch rotating"}></i>
                </Overlay>
            </Flex>

        </DefaultNoteInputContext.Provider>
    )
}


export const DefaultNoteInputContext = createContext({
    isShowNoteInputSettings: false,
    setIsShowNoteInputSettings: (isShow: boolean) => {},
    areNoteInputSettingsDisabled: false,
    setAreNoteInputSettingsDisabled: (areDisabled: boolean) => {},

    codeNoteInputLanguage: "",
    setCodeNoteInputLanguage: (language: string) => {},

    codeNoteInputWithVariablesLanguage: "", 
    setCodeNoteInputcodeNoteInputWithVariablesLanguage: (language: string) => {},

    noteInputOverlayVisible: false,
    setNoteInputOverlayVisible: (isVisible: boolean) => {},

    animateCopyIcon: () => {},

    isFullScreen: false as boolean,
    setActivateFullScreenStyles: ({} as Function),
    setDeactivateFullScreenStyles: ({} as Function),
    toggleFullScreen: (event) => {}
});