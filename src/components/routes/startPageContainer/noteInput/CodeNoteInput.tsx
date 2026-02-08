import { Editor, Monaco } from "@monaco-editor/react";
import { editor, IKeyboardEvent } from "monaco-editor";
import { useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import { BLOCK_SETTINGS_ANIMATION_DURATION } from "../../../../helpers/constants";
import { logWarn } from "../../../../helpers/logUtils";
import { animateAndCommit, getCssConstant, getCSSValueAsNumber, getRandomString, isNumberFalsy, setClipboardText, setCssConstant } from "../../../../helpers/utils";
import useWindowResizeCallback from "../../../../hooks/useWindowResizeCallback";
import Button from "../../../helpers/Button";
import Flex from "../../../helpers/Flex";
import { StartPageContainerContext } from "@/context/StartPageContainerContext";
import { DefaultCodeNoteInputContext } from "@/context/DefaultCodeNoteInputContext";
import { DefaultNoteInputContext } from "@/context/DefaultNoteInputContext";
import { NoteContext } from "@/context/NoteContext";
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
    const editorLineHeight = 26;
    /** Min number of lines visible on render */
    const minNumInitialLines = 3;
    const maxNumLines = 15;

    const [isEditorMounted, setIsEditorMounted] = useState(false);
    /** Refers to the editors width with collapsed noteInput settings. Is updated on window resize. */
    const [fullEditorWidth, setFullEditorWidth] = useState<number>(NaN);
    const [editorWidth, setEditorWidth] = useState("100%");
    const [editorTransition, setEditorTransition] = useState(0);
    // const [numEditorLines, setNumEditorLines] = useState(1);
    const [editorHeight, setEditorHeight] = useState(0);
    const [editorKey, setEditorKey] = useState("initialKey");

    const { isStartPageSideBarVisible, getStartPageSideBarWidth } = useContext(StartPageContainerContext);
    const { updateNoteEdited, clickSaveButton } = useContext(NoteContext);
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
    const inputContainerRef = useRef<HTMLDivElement>(null);
    // assigned in editor mount function
    const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
    const copyButtonRef = useRef(null);
    const fullScreenButtonRef = useRef(null);
    
    useEffect(() => {
        setAreNoteInputSettingsDisabled(true);

        setActivateFullScreenStyles(() => {return activateFullScreenStyles});
        setDeactivateFullScreenStyles(() => {return deactivateFullScreenStyles});

        setEditorHeight(getInitialEditorHeight());
    }, []);

    useEffect(() => {
        if (focusOnRender && isEditorMounted)
            editorRef.current!.focus();

    }, [isEditorMounted, editorRef.current]);
    
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

    function handleChange(value: string | undefined, _ev: editor.IModelContentChangedEvent): void {
        updateActualEditorHeight();

        updateNoteEntity(value ?? null);

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
        // make sure there's always additional space of 2 lines for readability 
        const targetHeight = (getNumEditorValueLines(editorRef.current!.getValue()) * editorLineHeight) + (2 * editorLineHeight);
        const heightDiff = targetHeight - editorHeight;
        const lineDiff = Math.ceil(heightDiff / editorLineHeight);

        // case: editor height needs at least one more line
        if (lineDiff > 0) {
            for (let i = 0; i < lineDiff; i++)
                handleAddLine();

        // case: editor height is at least one line too  high
        } else if (lineDiff < 0) {
            for (let i = 0; i < Math.abs(lineDiff); i++)
                handleRemoveLine();
        }
    }

    function handleAddLine(): void {
        if (isMaxEditorHeight())
            return;

        setEditorHeight((prev) => prev + editorLineHeight);
    }

    function handleRemoveLine(): void {
        if (isMinEditorHeight())
            return;

        setEditorHeight((prev) => prev - editorLineHeight);
    }

    /**
     * 
     * @returns the initial height of the editor depending on the initial number of lines of the ```noteEntityInput.value``` and ```minNumInitialLines```
     */
    function getInitialEditorHeight(): number {
        let numEditorValueLines = getNumEditorValueLines(noteInputEntity.value);

        if (numEditorValueLines < minNumInitialLines)
            numEditorValueLines = minNumInitialLines;

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

    async function handleCopyClick(): Promise<void> {
        animateCopyIcon();

        setClipboardText((editorRef.current as any).getValue())
    }

    function handleEditorMount(editor: editor.IStandaloneCodeEditor, _monaco: Monaco): void {
        // assign ref
        (editorRef.current as any) = editor;

        setIsEditorMounted(true);

        editor.onKeyDown(handleKeyDown);
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
        const defaultCodeNoteInput = defaultCodeNoteInputRef!.current!
        const editorContainer = inputContainerRef.current!;

        const appOverlayZIndex = getCssConstant("overlayZIndex");

        defaultCodeNoteInput.style.position = "fixed"; // hardcoded in css
        defaultCodeNoteInput.style.zIndex = appOverlayZIndex + 1;
        defaultCodeNoteInput.style.width = "90vw";
        // center
        defaultCodeNoteInput.style.left = "5vw";
        editorContainer.style.width = "100%";
        editorContainer.style.maxHeight = "unset";
        updateFullEditorWidth();

        defaultCodeNoteInput.style.top = "10vh";
        editorContainer.style.height = "80vh";

        editorRef.current!.focus();
    }

    function deactivateFullScreenStyles(): void {
        const defaultCodeNoteInput = defaultCodeNoteInputRef!.current!;
        const editorContainer = inputContainerRef.current!;
        
        // move up just a little bit
        defaultCodeNoteInput.style.position = "relative";
        defaultCodeNoteInput.style.top = "30px";
        
        // resize quickly
        defaultCodeNoteInput.style.width = "100%";
        updateFullEditorWidth();
        updateActualEditorWidth();

        editorContainer.style.height = "unset";

        defaultCodeNoteInput.style.left = "auto";
        defaultCodeNoteInput.style.position = "static";
        defaultCodeNoteInput.style.top = "auto";
        defaultCodeNoteInput.style.zIndex = "0";
        rerenderEditor();

        setTimeout(() => {
            editorRef.current!.focus();
        }, 100); // wait for rerender to be finished
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

    function handleKeyDown(e: IKeyboardEvent): void {
        if (e.ctrlKey && e.keyCode === 49) { // === "s"
            e.preventDefault();
            clickSaveButton();
        }
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
            <div className="fullWidth inputContainer" ref={inputContainerRef} onClick={() => editorRef.current!.focus()}>
                <Editor 
                    key={editorKey}
                    className="vsCodeEditor" 
                    height={editorHeight} 
                    language={codeNoteInputLanguage.toLowerCase()}
                    theme="vs-dark"
                    defaultValue={noteInputEntity.value}
                    options={{
                        lineNumbers: 'off',
                        minimap: {
                            enabled: false
                        }
                    }}
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
                        className="defaultNoteInputButton" 
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
                        onClick={(e) => {toggleFullScreen(e); updateActualEditorHeight();}}
                    >
                        {isFullScreen ?
                            <i className="fa-solid fa-down-left-and-up-right-to-center"></i> :
                            <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
                        }
                    </Button>

                    <NoteInputSettings className="me-1" noteInputEntity={noteInputEntity} areNoteInputSettingsDisabled={areNoteInputSettingsDisabled} />
                </Flex>
            </div>
                
            {children}
        </Flex>
    )
}
