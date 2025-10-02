import { Editor, Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import React, { useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import "../../../../assets/styles/CodeNoteInput.scss";
import { BLOCK_SETTINGS_ANIMATION_DURATION, CODE_INPUT_FULLSCREEN_ANIMATION_DURATION } from "../../../../helpers/constants";
import { animateAndCommit, getCssConstant, getCSSValueAsNumber, getRandomString, isNumberFalsy, logDebug, logWarn, percentToPixels, setClipboardText, setCssConstant } from "../../../../helpers/utils";
import useWindowResizeCallback from "../../../../hooks/useWindowResizeCallback";
import Button from "../../../helpers/Button";
import Flex from "../../../helpers/Flex";
import { StartPageContainerContext } from "../StartPageContainer";
import { DefaultCodeNoteInputContext } from "./DefaultCodeNoteInput";
import { DefaultNoteInputContext } from "./DefaultNoteInput";
import { NoteContext } from "./Note";
import NoteInputSettings from "./NoteInputSettings";


interface Props extends DefaultProps {
    noteInputEntity: NoteInputEntity
}


/**
 * Component containing the noteInput with the complex code editor (vscode).
 * 
 * Width:
 * 
 * The editors width is animated on "toggle noteInput settings" using "px" as unit. In any non-dynamic state the width unit must
 * be "%" for it to adapt to window resize.
 * 
 * @since 0.0.1
 */
export default function CodeNoteInput({noteInputEntity, ...props}: Props) {
    /** Height of one line of the monaco vscode editor in px */
    const editorLineHeight = 19; // px

    /** Min number of lines visible on render */
    const minNumInitialLines = 3;

    const maxNumLines = 15;

    const [isEditorMounted, setIsEditorMounted] = useState(false);
    /** Refers to the editors width with collapsed noteInput settings. Is updated on window resize. */
    const [fullEditorWidth, setFullEditorWidth] = useState<number>(NaN);
    const [editorWidth, setEditorWidth] = useState("100%");
    const [editorTransition, setEditorTransition] = useState(0);
    const [numEditorLines, setNumEditorLines] = useState(1);
    const [editorHeight, setEditorHeight] = useState(0);
    const [editorKey, setEditorKey] = useState("initialKey");

    const { isStartPageSideBarVisible, getStartPageSideBarWidth } = useContext(StartPageContainerContext);
    const { updateNoteEdited } = useContext(NoteContext);
    const { 
        isShowNoteInputSettings, 
        areNoteInputSettingsDisabled, 
        setAreNoteInputSettingsDisabled, 
        codeNoteInputLanguage,
        animateCopyIcon,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,
        isFullScreen,
        handleDeleteNote,
        focusOnRender
    } = useContext(DefaultNoteInputContext);
    const { componentRef: defaultCodeNoteInputRef } = useContext(DefaultCodeNoteInputContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "CodeNoteInput");

    const componentRef = useRef<HTMLDivElement>(null);
    // assigned in editor mount function
    const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
    const copyButtonRef = useRef(null);
    const fullScreenButtonRef = useRef(null);
    
    useEffect(() => {
        setAreNoteInputSettingsDisabled(true);
        updateFullScreenSetterStates();
        
        setEditorHeight(getInitialEditorHeight());
        
    }, []);

    useEffect(() => {
        if (focusOnRender && isEditorMounted)
            editorRef.current!.focus();

    }, [isEditorMounted, editorRef.current]);
    
    useEffect(() => {
        if (isEditorMounted)
            updateActualEditorHeight();

        updateFullScreenSetterStates();

    }, [editorHeight, numEditorLines]);

    useEffect(() => {
        if (isEditorMounted)
            updateActualEditorWidth(); 

    }, [editorWidth]);

    useEffect(() => {
        // case: init width has ben set
        if (!isNumberFalsy(fullEditorWidth))
            handleToggleNoteInputSettings();

    }, [isShowNoteInputSettings]);

    useEffect(() => {
        // case: init width has ben set
        if (!isNumberFalsy(fullEditorWidth))
            handleToggleSideBar();

    }, [isStartPageSideBarVisible]);

    useEffect(() => {
        if (!isEditorMounted)
            return;
        
        updateFullEditorWidth();

        setAreNoteInputSettingsDisabled(false);

    }, [isEditorMounted]);

    useEffect(() => {
        if (!isEditorMounted)
            return;

        updateNoteEntity(null);

    }, [codeNoteInputLanguage]);

    useWindowResizeCallback(handleWindowResize);

    function handleChange(value: string): void {
        if (!isFullScreen)
            setTimeout(() => setNumEditorLines(getNumEditorValueLines(value)), 5);

        updateNoteEntity(value);

        updateNoteEdited();
    }

    /**
     * Set ```noteInputEntity``` values using this noteInput.
     */
    function updateNoteEntity(value: string | null): void {
        if (value !== null)
            noteInputEntity.value = value;

        // programmingLanguage
        noteInputEntity.programmingLanguage = codeNoteInputLanguage;
    }

    function updateFullScreenSetterStates(): void {
        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});
    }

    /**
     * @param value complete content of the editor
     * @returns the current number of lines of the editor value
     */
    function getNumEditorValueLines(value: string): number {
        return value.split("\n").length;
    }

    /**
     * Check if editor height still fits number of rendered lines and adjust if not.
     */
    function updateActualEditorHeight(): void {
        const editorLinesHeightComparison = compareEditorHeightToLinesHeight();

        // increase editor height if possible
        if (editorLinesHeightComparison === -1 && !isMaxEditorHeight())
            handleAddLine();
        
        // decrease editor height if possible
        else if (editorLinesHeightComparison === 1 && !isMinEditorHeight())
            handleRemoveLine();
    }

    /**
     * Describes the height of the editor in comparison to the height of all rendered editor lines.
     * 
     * Ideally the editor is always 2 lines higher than the current number of lines rendered.
     * 
     * @returns -1 if the editor is too small, 0 if it's the right height and 1 if it's too big
     */
    function compareEditorHeightToLinesHeight(): number {
        const totalEditorLinesHeight = getTotalEditorLinesHeight();
        const heightDifference = editorHeight - totalEditorLinesHeight - (1 * editorLineHeight);

        // dont devide by 0
        if (heightDifference === 0)
            return 0;
        
        return heightDifference / Math.abs(heightDifference);
    }

    /**
     * @returns the total height of all lines inside the editor
     */
    function getTotalEditorLinesHeight(): number {
        return numEditorLines * editorLineHeight;
    }
    
    function handleAddLine(): void {
        // case: reached max editor height
        if (isMaxEditorHeight())
            return;

        setEditorHeight(editorHeight + 19);
    }

    function handleRemoveLine(): void {
        setEditorHeight(editorHeight - 19);
    }

    /**
     * 
     * @returns the initial height of the editor depending on the initial number of lines of the ```noteEntityInput.value``` and ```minNumInitialLines```
     */
    function getInitialEditorHeight(): number {
        let numEditorValueLines = getNumEditorValueLines(noteInputEntity.value);

        if (numEditorValueLines < minNumInitialLines)
            numEditorValueLines = minNumInitialLines;

        numEditorValueLines++;

        return numEditorValueLines * editorLineHeight;
    }

    function isMaxEditorHeight(): boolean {
        return editorHeight === maxNumLines * editorLineHeight;
    }

    function isMinEditorHeight(): boolean {
        return editorHeight === minNumInitialLines * editorLineHeight;
    }

    /**
     * Increase or decrease the editors width by the ```<NoteInputSettings>``` width depending on whether the noteInput settings are visible or not.
     */
    function handleToggleNoteInputSettings(): void {
        // case: show noteInput settings
        if (isShowNoteInputSettings) {
            const fullEditorWidth = updateFullEditorWidth();
            const noteInputSettingsWidth = getNoteInputSettingsWidth();
            const randomOffset = 3; // is a wild guess, depneds on the noteInput settings' width and margin etc

            // if mobile use only language search bar width, since settings will wrap
            const newEditorWidth = fullEditorWidth - noteInputSettingsWidth + randomOffset; 

            setEditorTransition(0);
            setEditorWidth(newEditorWidth + "px");
        
        // case: hide noteInput settings
        } else {
            setEditorTransition(BLOCK_SETTINGS_ANIMATION_DURATION);
            setEditorWidth(fullEditorWidth + "px");
        }
    }


    /**
     * Increase or decrease the editors width by the ```<StartPageSideBar>``` width depending on whether the it's visible or not.
     */
    function handleToggleSideBar(): void {
        setEditorTransition(isStartPageSideBarVisible ? 0 : BLOCK_SETTINGS_ANIMATION_DURATION + 10);

        // case: show side bar
        if (isStartPageSideBarVisible) {
            const fullEditorWidth = updateFullEditorWidth();
            const sideBarWidth = getStartPageSideBarWidth();

            setEditorWidth(fullEditorWidth - sideBarWidth + "px");
        
        // case: hide noteInput settings
        } else
            setEditorWidth(fullEditorWidth + "px");
    }


    /**
     * Animate the width of the editor to ```editorWidth``` using ```editorTransition``` as animation duration.
     */ 
    function updateActualEditorWidth(targetWdith = editorWidth): void {
        const editor = getOuterEditorContainer();

        if (!targetWdith || targetWdith.includes("NaN")) {
            logWarn("Invalid targetWdith");
            return;
        }

        animateAndCommit(
            editor,
            { width: targetWdith },
            { duration: editorTransition },
            () => setTimeout(() => 
                getOuterEditorContainer()!.style.width = "100%", 300) // wait for possible sidebar animations to finish, even though editor is done
        );
    }

    function handleWindowResize(): void {
        if (!isFullScreen)
            // reload editors width
            rerenderEditor();
    }

    /**
     * @returns the most outer container (a ```<section>```) of the monaco editor. The ```editorRef``` is somewhere deeper inside
     */
    function getOuterEditorContainer(): HTMLElement | null {
        if (!componentRef.current)
            return null;

        return componentRef.current!.querySelector("section") as HTMLElement;
    }

    async function handleCopyClick(event): Promise<void> {
        animateCopyIcon();

        setClipboardText((editorRef.current as any).getValue())
    }

    function handleEditorMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco): void {
        // assign ref
        (editorRef.current as any) = editor;

        setIsEditorMounted(true);
    }

    /**
     * Update ```fullEditorWidth``` state with the current outer width of the editor container in px.
     */
    function updateFullEditorWidth(): number {
        let newFullEditorWidth = getOuterEditorContainer()?.offsetWidth || 0;

        setFullEditorWidth(newFullEditorWidth);
        setCssConstant("fullEditorWidth", newFullEditorWidth + "px");

        return newFullEditorWidth;
    }
    

    function activateFullScreenStyles(): void {
        const editor = getOuterEditorContainer()!;
        const defaultCodeNoteInput = defaultCodeNoteInputRef!.current!

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        defaultCodeNoteInput.style.position = "fixed"; // hardcoded in css
        defaultCodeNoteInput.style.zIndex = appOverlayZIndex + 1;
        defaultCodeNoteInput.style.width = "90vw";
        // center
        defaultCodeNoteInput.style.left = "5vw";
        editor.style.width = "100%";
        editor.style.maxHeight = "unset";
        updateFullEditorWidth();
        
        animateAndCommit(
            defaultCodeNoteInput, 
            [{ top: window.getComputedStyle(defaultCodeNoteInput).getPropertyValue("top") }, { top: "10vh" }], 
            { duration: CODE_INPUT_FULLSCREEN_ANIMATION_DURATION }
        );
        animateAndCommit(editor, {height: "80vh"}, {duration: CODE_INPUT_FULLSCREEN_ANIMATION_DURATION});

        editorRef.current!.focus();
    }

    function deactivateFullScreenStyles(): void {
        const defaultCodeNoteInput = defaultCodeNoteInputRef!.current!
        
        // move up just a little bit
        defaultCodeNoteInput.style.position = "relative";
        defaultCodeNoteInput.style.top = "30px";
        
        // resize quickly
        defaultCodeNoteInput.style.width = "100%";
        updateFullEditorWidth();
        updateActualEditorWidth();
        
        defaultCodeNoteInput.style.left = "auto";

        // animate to start pos
        animateAndCommit(
            defaultCodeNoteInput,
            { top: 0 },
            { duration: CODE_INPUT_FULLSCREEN_ANIMATION_DURATION },
            () => {
                // reset to initial styles
                defaultCodeNoteInput.style.position = "static";
                defaultCodeNoteInput.style.top = "auto";
                defaultCodeNoteInput.style.zIndex = "0";
                rerenderEditor();
            }
        )
    }


    /**
     * @returns the width of the expanded noteInput settings, not including the toggle button and considering
     *          mobile mode.
     */
    function getNoteInputSettingsWidth(): number {
        const languageSearchBarWidth = getCSSValueAsNumber(getCssConstant("languageSearchBarWidth"), 2);
        
        return languageSearchBarWidth;
    }

    /**
     * Change the `key` of the editor for it to be rerendered.
     */
    function rerenderEditor(): void {
        setEditorKey(getRandomString());
    }

    return (
        <Flex 
            id={id} 
            className={className + " fullWidth " + (isFullScreen && "fullScreen")}
            style={style}
            ref={componentRef}
            flexWrap="nowrap"
            verticalAlign="start"
            {...otherProps}
        >
            {/* Editor */}
            <div className="fullWidth editorContainer">
                <Editor 
                    key={editorKey}
                    className="vsCodeEditor" 
                    height={editorHeight} 
                    language={codeNoteInputLanguage.toLowerCase()}
                    theme="vs-dark"
                    defaultValue={noteInputEntity.value}
                    onChange={handleChange}
                    onMount={handleEditorMount}
                />
            </div>

            <div className="CodeNoteInput-buttonContainer">
                <Flex flexWrap="nowrap" horizontalAlign="right">
                    {/* Copy */}
                    <Button
                        className="defaultNoteInputButton copyButton"
                        title="Copy"
                        disabled={areNoteInputSettingsDisabled}
                        ref={copyButtonRef}
                        onClick={handleCopyClick}
                    >
                        <i className="fa-solid fa-copy"></i>
                        <i className="fa-solid fa-copy"></i>
                    </Button>

                    {/* Delete */}
                    <Button 
                        className="deleteNoteButton defaultNoteInputButton" 
                        title="Delete section"
                        onClick={handleDeleteNote}
                    >
                        <i className="fa-solid fa-xmark fa-lg"></i>
                    </Button>

                    {/* Fullscreen */}
                    <Button 
                        className={"fullScreenButton defaultNoteInputButton"}
                        title={isFullScreen ? "Normal screen" : "Fullscreen"}
                        disabled={areNoteInputSettingsDisabled}
                        ref={fullScreenButtonRef}
                        onClick={toggleFullScreen}
                    >
                        {isFullScreen ?
                            <i className="fa-solid fa-down-left-and-up-right-to-center"></i> :
                            <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
                        }
                    </Button>
                </Flex>

                <Flex className="fullWidth" horizontalAlign="right">
                    <NoteInputSettings noteInputEntity={noteInputEntity} areNoteInputSettingsDisabled={areNoteInputSettingsDisabled} />
                </Flex>
            </div>
                
            {children}
        </Flex>
    )
}