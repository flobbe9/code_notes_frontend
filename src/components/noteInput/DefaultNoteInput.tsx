import $ from "jquery";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { DefaultNoteInputProps } from "../../abstract/DefaultNoteInputProps";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import "../../assets/styles/DefaultNoteInput.scss";
import { CODE_BLOCK_DEFAULT_LANGUAGE, CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE } from "../../helpers/constants";
import { getJsxElementIndexByKey } from "../../helpers/utils";
import { AppContext } from "../App";
import Button from "../helpers/Button";
import Confirm from "../helpers/Confirm";
import Flex from "../helpers/Flex";
import Overlay from "../helpers/Overlay";
import { NoteContext } from "./Note";


interface Props extends DefaultNoteInputProps {
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

    const { isAppOverlayVisible, setIsAppOverlayVisible, showPopup } = useContext(AppContext);

    const { noteEntity, noteInputs, setNoteInputs } = useContext(NoteContext);

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

        showPopup((
            <Confirm 
                heading={<h3>Delete this section?</h3>}
                message={`Are you sure you want to delete this section of the '${noteEntity.title}' note?`}
                onConfirm={deleteNote}
            />
        ));
    }


    function deleteNote(): void {

        const noteInputEntityIndex = getJsxElementIndexByKey(noteInputs, propsKey);

        // update app user
        noteEntity.noteInputs?.splice(noteInputEntityIndex, 1);

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

        setIsAppOverlayVisible(true);
    }


    function deactivateFullScreen() {

        deactivateFullScreenStyles();

        setIsFullScreen(false);

        if (isAppOverlayVisible)
            setIsAppOverlayVisible(false);
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