import React, { createContext, DragEvent, RefObject, useContext, useEffect, useRef, useState } from "react";
import { DefaultNoteInputProps } from "../../../../abstract/DefaultNoteInputProps";
import { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { CODE_BLOCK_DEFAULT_LANGUAGE, CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE } from "../../../../helpers/constants";
import { addClass, animateAndCommit, getJsxElementIndexByKey, isNumberFalsy, removeClass, shortenString } from "../../../../helpers/utils";
import { AppContext } from "../../../App";
import Confirm from "../../../helpers/Confirm";
import Flex from "../../../helpers/Flex";
import Hr from "../../../helpers/Hr";
import { NoteContext } from "./Note";
import { handleRememberMyChoice } from "../../../../helpers/projectUtils";


interface Props extends DefaultNoteInputProps {
}


/**
 * Parent component for any noteInput component. Defines some default behaviour and styling for all noteInputs.
 * 
 * Is referred to as "Section" for the user.
 *  
 * @since 0.0.1
 */
export default function DefaultNoteInput({noteInputEntity, propsKey, focusOnRender = false, ...props}: Props) {

    const [isShowNoteInputSettings, setIsShowNoteInputSettings] = useState(false);
    const [areNoteInputSettingsDisabled, setAreNoteInputSettingsDisabled] = useState(false);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activateFullScreenStyles, setActivateFullScreenStyles] = useState<Function>(() => {});
    const [deactivateFullScreenStyles, setDeactivateFullScreenStyles] = useState<Function>(() => {});

    const [codeNoteInputLanguage, setCodeNoteInputLanguage] = useState(noteInputEntity.programmingLanguage || CODE_BLOCK_DEFAULT_LANGUAGE);
    const [codeNoteInputWithVariablesLanguage, setCodeNoteInputWithVariablesLanguage] = useState(noteInputEntity.programmingLanguage || CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE);

    const componentName = "DefaultNoteInput";
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, componentName);

    const componentRef = useRef<HTMLDivElement>(null);
    const topMostDropZoneHrHrRef = useRef<HTMLDivElement>(null);
    const dropZoneHrRef = useRef<HTMLDivElement>(null);

    const { isAppOverlayVisible, setIsAppOverlayVisible, showPopup } = useContext(AppContext);

    const { 
        noteEntity, 
        noteInputs, 
        setNoteInputs, 
        updateNoteEdited,
        draggedNoteInputIndex,
        setDraggedNoteInputIndex,
        dragOverNoteInputIndex,
        setDragOverNoteInputIndex,
        setAreNoteInputsExpanded
    } = useContext(NoteContext);

    const context = {
        isShowNoteInputSettings, 
        setIsShowNoteInputSettings,
        areNoteInputSettingsDisabled,
        setAreNoteInputSettingsDisabled,

        codeNoteInputLanguage, 
        setCodeNoteInputLanguage,

        codeNoteInputWithVariablesLanguage, 
        setCodeNoteInputWithVariablesLanguage,

        animateCopyIcon,

        isFullScreen,
        setActivateFullScreenStyles,
        setDeactivateFullScreenStyles,
        toggleFullScreen,

        handleDeleteNote,

        focusOnRender,

        componentRef
    }


    useEffect(() => {
        window.addEventListener("keydown", handleGlobalKeyDown);

        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        }

    }, [isFullScreen, isAppOverlayVisible]);


    useEffect(() => {
        // deactivate full screen on overlay click
        if (!isAppOverlayVisible && isFullScreen) 
            deactivateFullScreen();

    }, [isAppOverlayVisible]);


    useEffect(() => {
        handleDragOverNoteInputIndexChange();

    }, [dragOverNoteInputIndex])


    function handleDeleteNote(): void {

        if (handleRememberMyChoice("deleteNoteInput", deleteNoteInput))
            return;

        showPopup((
            <Confirm 
                heading={<h3>Delete this section?</h3>}
                message={`Are you sure you want to delete this section of the '${shortenString(noteEntity.title)}' note?`}
                confirmLabel="Delete"
                rememberMyChoice
                rememberMyChoiceLabel="Don't ask again"
                rememberMyChoiceKey="deleteNoteInput"
                onConfirm={deleteNoteInput}
            />
        ));
    }


    function deleteNoteInput(): void {

        const noteInputEntityIndex = getJsxElementIndexByKey(noteInputs, propsKey);

        // update app user
        noteEntity.noteInputs?.splice(noteInputEntityIndex, 1);

        const newNoteInputs = noteInputs;
        newNoteInputs.splice(noteInputEntityIndex, 1);
        setNoteInputs([...newNoteInputs]);

        // is visible if is fullscreen
        setIsAppOverlayVisible(false);

        setAreNoteInputsExpanded(true);

        updateNoteEdited();
    }


    /**
     * Animate the icon of the "copy" button.
     */
    function animateCopyIcon(): void {
        const copyIcon = componentRef.current!.querySelector(".copyButton .fa-copy") as HTMLElement;

        animateAndCommit(
            copyIcon,
            {
                opacity: 0,
                fontSize: "3em"
            },
            { duration: 400, easing: "ease-out" },
            () => {
                copyIcon.style.opacity = "1";
                copyIcon.style.fontSize = "1em";
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
            handleEscape();
    }


    function handleEscape(): void {

        if (isFullScreen)
            deactivateFullScreen();
    }
    
    function handleDragEnter(): void {
        setDragOverNoteInputIndex(getJsxElementIndexByKey(noteInputs, propsKey));
    }

    /**
     * Sets the ```draggedNoteInputIndex```, uses the whole ```<DefaultNoteInput>``` as dragImage and styles the dragged noteInput.
     * 
     * @param event 
     */
    function handleDragStart(event: DragEvent): void {
        setDraggedNoteInputIndex(getJsxElementIndexByKey(noteInputs, propsKey));

        event.dataTransfer.dropEffect = "move";

        let dragImage: HTMLElement = componentRef.current!.querySelector(".ContentEditableDiv") as HTMLElement;
        if (componentRef.current!.querySelector(".CodeNoteInput"))
            dragImage = componentRef.current!.querySelector(".CodeNoteInput .view-lines") as HTMLElement;

        event.dataTransfer.setDragImage(dragImage, 0, 0);

        addClass(componentRef.current!, `${componentName}-dragged`);
    }

    /**
     * Remove styles of dragged noteInput and reset drag index states.
     */
    function handleDragEnd(): void {
        removeClass(componentRef.current!, `${componentName}-dragged`);
        setDraggedNoteInputIndex(NaN);
        setDragOverNoteInputIndex(NaN);
    }

    /**
     * Activate or deactivate styles of ```<hr>``` elements during drag over. Make sure to not activate them if the noteInput position
     * would not change on drop
     */
    function handleDragOverNoteInputIndexChange(): void {
        // case: is drag end
        if (isNumberFalsy(draggedNoteInputIndex)) {
            deactivateDragOverStyles();
            return;
        }

        const noteInputIndex = getJsxElementIndexByKey(noteInputs, propsKey);
        
        const isDraggingOverThisNoteInput = dragOverNoteInputIndex === noteInputIndex;
        const isNoteInputRightBeforeDraggedInput = draggedNoteInputIndex === dragOverNoteInputIndex + 1;
        const isDraggingToTopMostNoteInput = noteInputIndex === 0 && dragOverNoteInputIndex === -1;
        const isBeeingDragged = draggedNoteInputIndex === noteInputIndex;

        deactivateDragOverStyles();

        // case: dropping would not change the position
        if (isBeeingDragged || isNoteInputRightBeforeDraggedInput)
            return;

        if (isDraggingToTopMostNoteInput)
            addClass(topMostDropZoneHrHrRef.current!, `${componentName}-dropZoneHr-active`)

        else if (isDraggingOverThisNoteInput)
            addClass(dropZoneHrRef.current!, `${componentName}-dropZoneHr-active`)
    }


    function deactivateDragOverStyles(): void {
        removeClass(dropZoneHrRef.current!, `${componentName}-dropZoneHr-active`);
        removeClass(topMostDropZoneHrHrRef.current!, `${componentName}-dropZoneHr-active`);
    }
    

    return (
        <DefaultNoteInputContext.Provider value={context}>
            <div
                id={id} 
                className={className}
                style={style}
                ref={componentRef}
                onDragEnter={handleDragEnter}
                {...otherProps}
            >
                {/* Topmost dropZoneHr */}
                <Hr 
                    className={`${componentName}-dropZoneHr`} 
                    hidden={getJsxElementIndexByKey(noteInputs, propsKey) !== 0} 
                    ref={topMostDropZoneHrHrRef} 
                />

                <Flex flexWrap="nowrap">
                    {/* Drag area */}
                    <Flex 
                        className={`${componentName}-dragArea`} 
                        verticalAlign="center"
                        title="Move section"
                        draggable 
                        onDragStart={handleDragStart} 
                        onDragEnd={handleDragEnd}
                    >
                        <span className={`${componentName}-dragArea-dragIcon px-1`}>&#10303;</span>
                    </Flex>

                    <div className="DefaultNoteInput-content fullWidth">
                        {/* NoteInput */}
                        {children}
                    </div>
                </Flex>

                {/* DropZoneHr */}
                <Hr className={`${componentName}-dropZoneHr`} ref={dropZoneHrRef} />
            </div>
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
    setCodeNoteInputWithVariablesLanguage: (language: string) => {},

    animateCopyIcon: () => {},

    isFullScreen: false as boolean,
    setActivateFullScreenStyles: ({} as Function),
    setDeactivateFullScreenStyles: ({} as Function),
    toggleFullScreen: (event) => {},

    handleDeleteNote: (event) => {},

    focusOnRender: false as boolean,

    componentRef: {} as RefObject<HTMLDivElement>
});
