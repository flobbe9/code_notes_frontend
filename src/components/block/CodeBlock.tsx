import React, { useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/CodeBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { Editor } from "@monaco-editor/react";
import { getCssConstant, getCSSValueAsNumber, isBlank, isNumberFalsy, log, setClipboardText } from "../../helpers/utils";
import { DefaultBlockContext } from "./DefaultBlock";
import { AppContext } from "../App";
import Button from "../helpers/Button";
import Flex from "../helpers/Flex";
import { DefaultCodeBlockContext } from "./DefaultCodeBlock";
import useWindowResizeCallback from "../../hooks/useWindowResizeCallback";
import { BLOCK_SETTINGS_ANIMATION_DURATION } from "../../helpers/constants";
import { StartPageContainerContext } from "../StartPageContainer";
import { NoteInput } from "../../abstract/entites/NoteInput";
import BlockSettings from "./BlockSettings";


interface Props extends DefaultProps {

    noteInput: NoteInput
}


/**
 * Component containing the block with the complex code editor (vscode).
 * 
 * Width:
 * 
 * The editors width is animated on "toggle block settings" using "px" as unit. In any non-dynamic state the width unit must
 * be "%" for it to adapt to window resize.
 * 
 * @since 0.0.1
 */
// IDEA: 
    // change theme (settings)
        // adjust some css classes
    // toggle minimap ? (settings)
export default function CodeBlock({noteInput, ...props}: Props) {

    /** Height of one line of the monaco vscode editor in px */
    const editorLineHeight = 19; // px

    /** Min number of lines visible on render */
    const minNumInitialLines = 3;

    const maxNumLines = 15;

    const [isEditorMounted, setIsEditorMounted] = useState(false);
    /** Refers to the editors width with collapsed block settings. Is updated on window resize. */
    const [fullEditorWidth, setFullEditorWidth] = useState<number>(NaN);
    const [editorWidth, setEditorWidth] = useState("100%");
    const [editorTransition, setEditorTransition] = useState(0);
    const [numEditorLines, setNumEditorLines] = useState(1);
    const [editorValue, setEditorValue] = useState(noteInput.value);
    const [editorHeight, setEditorHeight] = useState(0);

    const { 
        getAppOverlayZIndex 
    } = useContext(AppContext);

    const { isShowSideBar, getStartPageSideBarWidth } = useContext(StartPageContainerContext);

    const { 
        isShowBlockSettings, 
        areBlockSettingsDisabled, 
        setAreBlockSettingsDisabled, 
        codeBlockLanguage,
        animateCopyIcon,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,
        isFullScreen
    } = useContext(DefaultBlockContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "CodeBlock");

    const componentRef = useRef(null);
    const editorRef = useRef(null);
    const copyButtonRef = useRef(null);
    const fullScreenButtonRef = useRef(null);


    useEffect(() => {
        setAreBlockSettingsDisabled(true);
        updateFullScreenSetterStates();

        setEditorHeight(getInitialEditorHeight());

    }, []);


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
            handleToggleBlockSettings();

    }, [isShowBlockSettings]);


    useEffect(() => {
        // case: init width has ben set
        if (!isNumberFalsy(fullEditorWidth))
            handleToggleSideBar();

    }, [isShowSideBar]);

    
    useEffect(() => {
        if (!isEditorMounted)
            return;
        
        updateFullEditorWidth();

        setAreBlockSettingsDisabled(false);


    }, [isEditorMounted]);


    useEffect(() => {
        if (!isEditorMounted)
            return;

        updateAppUser();

    }, [codeBlockLanguage]);


    useWindowResizeCallback(handleWindowResize);


    function handleChange(value: string, event): void {

        if (!isFullScreen)
            setTimeout(() => setNumEditorLines(getNumEditorValueLines(value)), 5);

        updateAppUser();
    }


    /**
     * Set ```noteInput``` values using this block.
     * 
     * @param editorValue the current text in the editor
     */
    function updateAppUser(): void {

        const editorValue = getCurrentEditorValue();

        // value
        noteInput.value = editorValue;

        // programmingLanguage
        noteInput.programmingLanguage = codeBlockLanguage;
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
     * @returns the initial height of the editor depending on the initial number of lines of the ```editorValue``` and ```minNumInitialLines```
     */
    function getInitialEditorHeight(): number {

        let numEditorValueLines = getNumEditorValueLines(editorValue);

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
     * Increase or decrease the editors width by the ```<BlockSettings>``` width depending on whether the block settings are visible or not.
     */
    function handleToggleBlockSettings(): void {

        // case: show block settings
        if (isShowBlockSettings) {
            const fullEditorWidth = updateFullEditorWidth();
            const blockSettingsWidth = getBlockSettingsWidth();
            const randomOffset = 3; // is a wild guess, depneds on the block settings' width and margin etc

            // if mobile use only language search bar width, since settings will wrap
            const newEditorWidth = fullEditorWidth - blockSettingsWidth + randomOffset; 

            setEditorTransition(0);
            setEditorWidth(newEditorWidth + "px");
        
        // case: hide block settings
        } else {
            setEditorTransition(BLOCK_SETTINGS_ANIMATION_DURATION);
            setEditorWidth(fullEditorWidth + "px");
        }
    }


    /**
     * Increase or decrease the editors width by the ```<StartPageSideBar>``` width depending on whether the it's visible or not.
     */
    function handleToggleSideBar(): void {

        setEditorTransition(isShowSideBar ? 0 : BLOCK_SETTINGS_ANIMATION_DURATION + 10);

        // case: show side bar
        if (isShowSideBar) {
            const fullEditorWidth = updateFullEditorWidth();
            const sideBarWidth = getStartPageSideBarWidth();

            setEditorWidth(fullEditorWidth - sideBarWidth + "px");
        
        // case: hide block settings
        } else
            setEditorWidth(fullEditorWidth + "px");
    }


    /**
     * Animate the width of the editor to ```editorWidth``` using ```editorTransition``` as animation duration.
     */ 
    function updateActualEditorWidth(): void {

        const editor = getOuterEditorContainer();

        editor.animate(
            { width: editorWidth },
            editorTransition,
            "swing",
            () => setTimeout(() => 
                getOuterEditorContainer().css("width", "98%"), 300) // wait for possible sidebar animations to finish, even though editor is done
        )
    }


    function handleWindowResize(): void {

        if (isShowBlockSettings)
            setFullEditorWidth(getOuterEditorContainer().width()! - getBlockSettingsWidth());

        else
            updateFullEditorWidth();
    }


    /**
     * @returns the most outer container (a ```<section>```) of the monaco editor. The ```editorRef``` is somewhere deeper inside
     */
    function getOuterEditorContainer(): JQuery {

        return $(componentRef.current!).find("section").first();
    }


    async function handleCopyClick(event): Promise<void> {

        animateCopyIcon();

        setClipboardText((editorRef.current as any).getValue())
    }


    function handleEditorMount(editor, monaco): void {

        // assign ref
        (editorRef.current as any) = editor;

        setIsEditorMounted(true);
    }


    /**
     * Update ```fullEditorWidth``` state with the current outer width of the editor container in px.
     */
    function updateFullEditorWidth(): number {

        const newFullEditorWidth = getOuterEditorContainer().width()!;

        setFullEditorWidth(newFullEditorWidth);

        return newFullEditorWidth;
    }
    

    function activateFullScreenStyles(): void {

        const editor = getOuterEditorContainer();
        const defaultCodeBlock = editor.parents(".DefaultCodeBlock");

        const appOverlayZIndex = getAppOverlayZIndex();
        
        defaultCodeBlock.animate(
            { width: "90vw" },
            100,
            "swing",
            () => {
                editor.css({
                    width: "100%"
                });
                updateFullEditorWidth();
            }
        );

        defaultCodeBlock.css({
            position: "fixed", // hardcoded in css
            zIndex: appOverlayZIndex + 1
        });

        defaultCodeBlock.animate({top: "90px"}, 300);

        editor.animate({height: "80vh"});

        $(editorRef.current!).trigger("focus");
    }


    function deactivateFullScreenStyles(): void {

        const editor = getOuterEditorContainer();
        const defaultCodeBlock = editor.parents(".DefaultCodeBlock");
        
        // move up just a little bit
        defaultCodeBlock.css({
            position: "relative",
            top: "30px",
        });
        
        // resize quickly
        defaultCodeBlock.css({
            width: "100%"
        });
        updateFullEditorWidth();
        updateActualEditorWidth();

        editor.css({
            height: editorHeight,
            width: isShowBlockSettings ? editorWidth : fullEditorWidth
        });

        // animate to start pos
        defaultCodeBlock.animate(
            {
                top: 0,
            },
            300,
            "swing", 
            () => {
                // reset to initial styles
                defaultCodeBlock.css({
                    position: "static",
                    top: "auto",
                    zIndex: 0
                });
            }
        )
    }


    /**
     * @returns the width of the expanded block settings, not including the toggle button and considering
     *          mobile mode.
     */
    function getBlockSettingsWidth(): number {

        const languageSearchBarWidth = getCSSValueAsNumber(getCssConstant("languageSearchBarWidth"), 2);
        
        return languageSearchBarWidth;
    }


    /**
     * @returns the current value of the editor (taken from the textarea element inside) or a blank string if has not mounted yet
     */
    function getCurrentEditorValue(): string {

        if (!isEditorMounted)
            return "";

        const textArea = $(componentRef.current!).find("textarea.inputarea");

        return textArea.prop("value");
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
                    className="vsCodeEditor" 
                    height={editorHeight} 
                    width={"98%"}
                    language={codeBlockLanguage.toLowerCase()}
                    theme="vs-dark"
                    defaultValue={editorValue}
                    onChange={handleChange}
                    onMount={handleEditorMount}
                />
            </div>

            {/* Copy button */}
            <Button
                className="defaultBlockButton copyButton"
                title="Copy"
                disabled={areBlockSettingsDisabled}
                ref={copyButtonRef}
                onClick={handleCopyClick}
            >
                <i className="fa-solid fa-copy"></i>
                <i className="fa-solid fa-copy"></i>
            </Button>

            {/* Block Settings */}
            <BlockSettings noteInput={noteInput} areBlockSettingsDisabled={areBlockSettingsDisabled} />

            {/* Fullscreen button */}
            <Button 
                className={"fullScreenButton defaultBlockButton"}
                title={isFullScreen ? "Normal screen" : "Fullscreen"}
                disabled={areBlockSettingsDisabled}
                ref={fullScreenButtonRef}
                onClick={toggleFullScreen}
            >
                {isFullScreen ?
                    <i className="fa-solid fa-down-left-and-up-right-to-center"></i> :
                    <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
                }
            </Button>
                
            {children}
        </Flex>
    )
}