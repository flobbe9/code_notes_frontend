import React, { createContext, DragEvent, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteEntity } from "../../../../abstract/entites/NoteEntity";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import { NoteEntityService } from "../../../../abstract/services/NoteEntityService";
import "../../../../assets/styles/Note.scss";
import { DEFAULT_ERROR_MESSAGE } from "../../../../helpers/constants";
import { isResponseError } from "../../../../helpers/fetchUtils";
import { getJsxElementIndexByKey, getRandomString, handleRememberMyChoice, isNumberFalsy, logError, logWarn, shortenString } from '../../../../helpers/utils';
import { AppContext } from "../../../App";
import { AppFetchContext } from "../../../AppFetchContextHolder";
import ButtonWithSlideLabel from "../../../helpers/ButtonWithSlideLabel";
import Confirm from "../../../helpers/Confirm";
import Flex from "../../../helpers/Flex";
import HelperDiv from "../../../helpers/HelperDiv";
import Login from "../../Login";
import { StartPageContentContext } from "../StartPageContent";
import AddNewNoteInputButtons from "./AddNewNoteInputButtons";
import CodeNoteInput from "./CodeNoteInput";
import CodeNoteInputWithVariables from "./CodeNoteInputWithVariables";
import DefaultCodeNoteInput from "./DefaultCodeNoteInput";
import DefaultNoteInput from "./DefaultNoteInput";
import NoteTagList from "./NoteTagList";
import NoteTitle from "./NoteTitle";
import PlainTextNoteInput from "./PlainTextNoteInput";


interface Props extends DefaultProps {

    propsKey: string,
    /** Whether to focus the title on render. Default is ```false``` */
    focusOnRender?: boolean,
}


/**
 * Container containing a list of different ```NoteInput``` components.
 * 
 * @parent ```<StartPageContent>```
 * @since 0.0.1
 */
export default function Note({propsKey, focusOnRender = false, ...props}: Props) {

    const componentName = "Note";
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, componentName);

    const numInitialNoteInputs = 1;

    const [noteEntity, setNoteEntity] = useState(NoteEntityService.getDefaultInstance());
    const [noteInputs, setNoteInputs] = useState<JSX.Element[]>([]);

    const [areNoteInputsExpanded, setAreNoteInputsExpanded] = useState(false);

    /** Toggle state, value does not imply anything. Is toggled when adding a new note input */
    const [gotNewNoteInputs, setGotNewNoteInputs] = useState(false);

    const [draggedNoteInputIndex, setDraggedNoteInputIndex] = useState(NaN);
    /** Index of the noteInput, the mouse is currently hovering over while dragging another noteInput */
    const [dragOverNoteInputIndex, setDragOverNoteInputIndex] = useState(NaN); // NOTE: don't use -1 as default


    const { toast, showPopup, editedNoteIds, setEditedNoteIds } = useContext(AppContext);
    const { 
        appUserEntity, 
        appUserEntityUseQueryResult,

        isLoggedIn,

        noteEntities, 
        setNoteEntities, 
        fetchSaveNoteEntity, 
        fetchDeleteNoteEntity,
        noteUseQueryResult
    } = useContext(AppFetchContext);
    const { notes, setNotes } = useContext(StartPageContentContext);

    const componentRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const contentContainerRef = useRef<HTMLDivElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    const context = {
        noteEntity,

        noteInputs, 
        setNoteInputs,

        createNoteInputByNoteInputType,

        draggedNoteInputIndex, 
        setDraggedNoteInputIndex,
        dragOverNoteInputIndex, 
        setDragOverNoteInputIndex,

        noteEdited,

        gotNewNoteInputs,
        setGotNewNoteInputs,

        setAreNoteInputsExpanded,
    }
    

    useEffect(() => {
        updateNoteEntity();
        
    }, []);

    
    useEffect(() => {
        // on note render
        if (!noteInputs.length)
            setNoteInputs(mapNoteInputsToJsx());
        
    }, [noteEntity]);


    useEffect(() => {
        setNoteInputs(mapNoteInputsToJsx());
        
    }, [areNoteInputsExpanded]);
    

    useEffect(() => {
        handleAppendNoteInput();

    }, [gotNewNoteInputs]);

    
    useEffect(() => {
        if (focusOnRender)
            titleInputRef.current?.focus();

    }, [componentRef.current]);


    function mapNoteInputsToJsx(): JSX.Element[] {

        if (!noteEntity.noteInputs)
            return [];

        const noteInputs: JSX.Element[] = [];
        for (let i = 0; i < noteEntity.noteInputs.length; i++) {
            if (i === numInitialNoteInputs && !areNoteInputsExpanded)
                break;

            noteInputs.push(createNoteInputByNoteInputType(noteEntity.noteInputs[i]));
        }

        return noteInputs;
    }


    function createNoteInputByNoteInputType(noteInputEntity: NoteInputEntity, focusOnRender?: boolean): JSX.Element {

        const key = noteInputEntity.id ? noteInputEntity.id + "" : getRandomString();
        switch (noteInputEntity.type) {
            case "PLAIN_TEXT":
                return (
                    <DefaultNoteInput 
                        noteInputEntity={noteInputEntity} 
                        propsKey={key} 
                        key={key}
                        focusOnRender={focusOnRender}
                    >
                        <PlainTextNoteInput noteInputEntity={noteInputEntity} />
                    </DefaultNoteInput>
                    )

            case "CODE":
                return (
                    <DefaultCodeNoteInput 
                        noteInputEntity={noteInputEntity} 
                        propsKey={key} 
                        key={key}
                        focusOnRender={focusOnRender}
                    >
                        <CodeNoteInput noteInputEntity={noteInputEntity} />
                    </DefaultCodeNoteInput>
                )

            case "CODE_WITH_VARIABLES":
                return (
                    <DefaultCodeNoteInput 
                        noteInputEntity={noteInputEntity} 
                        propsKey={key} 
                        key={key}
                        focusOnRender={focusOnRender}
                    >
                        <CodeNoteInputWithVariables noteInputEntity={noteInputEntity} />
                    </DefaultCodeNoteInput>
                )

            // should not happen
            default: 
                return <div key={key}></div>;
        }
    }


    /**
     * Fetch method will validate and toast.
     * 
     * @param event 
     */
    async function handleSave(): Promise<void> {

        if (!isLoggedIn) {
            showPopup(<Login isPopupContent />);
            return;
        }
        
        const jsonResponse = await fetchSaveNoteEntity(noteEntity);
        if (isResponseError(jsonResponse)) {
            toast("Failed to save note", DEFAULT_ERROR_MESSAGE, "error");
            return;
        }

        // case: there's other unsaved notes
        if (editedNoteIds.size > 1) {
            const noteIndex = getJsxElementIndexByKey(notes, propsKey);
            noteEntities.splice(noteIndex, 1, jsonResponse);
            setNoteEntities([...noteEntities]);

        // case: no unsaved notes anymore
        } else
            noteUseQueryResult.refetch();

        noteEdited(false);

        toast("Save", "Successfully saved note", "success", 5000);
    }


    function handleDeleteNoteClick(): void {

        if (handleRememberMyChoice("deleteNote", deleteNote))
            return;

        showPopup(
            <Confirm
                heading={<h3>Delete this Note?</h3>}
                message={`Are you sure you want to delete '${shortenString(noteEntity.title)}'?`}
                confirmLabel="Delete"
                rememberMyChoice
                rememberMyChoiceLabel="Don't ask again"
                rememberMyChoiceKey="deleteNote"
                onConfirm={deleteNote}
            />
        );
    }


    /**
     * Fetch delete notes and update both ```noteEntities``` and ```notes``` state.
     */
    async function deleteNote(): Promise<void> {

        if (!appUserEntity)
            return;
        
        // case: note was never saved in the first place, dont fetch delete
        if (!isNumberFalsy(noteEntity.id)) {
            const response = await fetchDeleteNoteEntity(noteEntity);
            if (isResponseError(response)) {
                toast("Failed to delete note", DEFAULT_ERROR_MESSAGE, "error");
                return;
            }
            
            appUserEntityUseQueryResult.refetch();
        }

        const noteIndex = getJsxElementIndexByKey(notes, propsKey);

        // case: no unsaved notes or this one is the only unsaved note
        if ((!editedNoteIds.size || (editedNoteIds.size === 1 && editedNoteIds.has(noteEntity.id || -1))) && isLoggedIn)
            noteUseQueryResult.refetch();

        // case: got more unsaved notes
        else {
            noteEntities.splice(noteIndex, 1);
            setNoteEntities([...noteEntities]);
            
            notes.splice(noteIndex, 1);
            setNotes([...notes]);
        } 

        noteEdited(false);
    }


    /**
     * Mark ```noteEntity``` as edited or saved. Wont do anything if ```noteEntity.id``` is falsy.
     * 
     * @param edited indicates whether the note entity should be considered edited (```true```) or not edited (hence saved, ``false```). Default is ```true```
     */
    function noteEdited(edited = true): void {

        // case: propably not rendered yet, or never saved (hence not logged in)
        if (!noteEntity || isNumberFalsy(noteEntity.id))
            return;

        if (edited)
            editedNoteIds.add(noteEntity.id!);
        else 
            editedNoteIds.delete(noteEntity.id!);
        
        setEditedNoteIds(new Set(editedNoteIds));
    }


    /**
     * @returns ```true``` if note has a valid id (saved already) and is not edited
     */
    function isSaveButtonDisabled(): boolean {

        return !isNumberFalsy(noteEntity.id) && !editedNoteIds.has(noteEntity.id || -1);
    }


    /**
     * Update ```noteEntity``` state retrieving the correct note entity from ```noteEntities``` using the jsx element index of this note
     */
    function updateNoteEntity(): void {

        const noteEntity = getNoteEntityFromState();
        if (noteEntity)
            setNoteEntity(noteEntity)
    }


    /**
     * @returns the noteEntity from ```noteEntities``` state using this note's current index in ```notes```
     */
    function getNoteEntityFromState(): NoteEntity | undefined {

        // may happen on login / logout
        if (!noteEntities.length)
            return;

        const noteEntityIndex = getJsxElementIndexByKey(notes, propsKey);
        if (noteEntityIndex === -1) {
            logWarn("Cannot find noteEntity index");
            return;
        }

        if (noteEntityIndex >= noteEntities.length) {
            logWarn(`Note entity index ${noteEntityIndex} out of bounds for 'noteEntities' length ${noteEntities.length}`);
            return;
        }

        return noteEntities[noteEntityIndex];
    }


    /**
     * Will append dragged note input AFTER the note input currently dragging over. Updates both ```noteInputs``` and ```noteEntity.noteInputs```.
     * 
     * @param event should not contain any data in ```event.dataTransfer.getData()```, dropping into content editable divs should be safe
     */
    function handleDrop(event: DragEvent): void {
        
        event.preventDefault();

        // case: no note inputs (should not happen)
        if (!noteEntity.noteInputs?.length)
            return;

        // case: dropped at same position
        if (draggedNoteInputIndex === dragOverNoteInputIndex || draggedNoteInputIndex === dragOverNoteInputIndex + 1)
            return;

        let draggedNoteInputEntity = noteEntity.noteInputs[draggedNoteInputIndex],
            draggedNoteInput = noteInputs[draggedNoteInputIndex],
            fixedDraggedOverNoteInputIndex = draggedNoteInputIndex < dragOverNoteInputIndex ? dragOverNoteInputIndex : dragOverNoteInputIndex + 1;

        // case: index out of bounds, happens e.g. when dropping a noteInput from a different note
        if (!draggedNoteInputEntity || !draggedNoteInput) {
            logError(`'draggedNoteInputIndex' ${draggedNoteInputIndex} out of bounds for 'noteEntity.noteInputs' of length ${noteEntity.noteInputs.length} `)
            return;
        }

        // reorder 
        noteEntity.noteInputs.splice(draggedNoteInputIndex, 1);
        noteEntity.noteInputs.splice(fixedDraggedOverNoteInputIndex, 0, draggedNoteInputEntity);
        noteInputs.splice(draggedNoteInputIndex, 1);
        noteInputs.splice(fixedDraggedOverNoteInputIndex, 0, draggedNoteInput);
        setNoteInputs([...noteInputs]);

        noteEdited();
    }
    

    /**
     * Update ```noteInputs``` state creating a new ```noteInput``` from the last ```noteEntity.noteInputs``` element
     */
    function handleAppendNoteInput(): void {

        if (!noteEntity.noteInputs?.length || !areNoteInputsExpanded) 
            return;

        const newNoteInput = createNoteInputByNoteInputType(noteEntity.noteInputs[noteEntity.noteInputs.length - 1], true);
        setNoteInputs([...noteInputs, newNoteInput]);
    }


    return (
        <NoteContext.Provider value={context}>
            <HelperDiv 
                id={id} 
                className={`${className}`}
                style={style}
                ref={componentRef}
                {...otherProps}
            >
                <div 
                    ref={contentContainerRef}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <Flex 
                        className="fullWidth pb-4" 
                        flexWrap="nowrap" 
                        onDragEnter={() => setDragOverNoteInputIndex(-1)}
                    >
                        {/* Title */}
                        <NoteTitle className="me-1 col-6" ref={titleInputRef} />

                        {/* Tags */}
                        <NoteTagList className="col-6" />
                    </Flex>

                    {/* NoteInputs */}
                    {noteInputs}
                </div>

                {/* Show all */}
                <Flex horizontalAlign="center">
                    <ButtonWithSlideLabel
                        className={`${componentName}-showAllButton mb-2`}
                        rendered={(noteEntity.noteInputs || []).length > numInitialNoteInputs}
                        label={areNoteInputsExpanded ? "Show less" : "Show all"}
                        title={areNoteInputsExpanded ? "Show less sections" : "Show all sections"}
                        onClick={() => setAreNoteInputsExpanded(!areNoteInputsExpanded)}
                    >
                        <i className={`${componentName}-showAllButton-arrowIcon fa-solid fa-chevron-down ${areNoteInputsExpanded && 'rotate180'}`}></i>
                    </ButtonWithSlideLabel>
                </Flex>

                <Flex className="mt-2">
                    {/* Add note input */}
                    <AddNewNoteInputButtons className="col-12 col-xl-9" />

                    {/* Delete */}
                    <Flex className="col-12 col-xl-3 mt-2" horizontalAlign="right">
                        <ButtonWithSlideLabel 
                            className="transition deleteNoteButton" 
                            label="Delete note"
                            title="Delete note" 
                            onClick={handleDeleteNoteClick}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </ButtonWithSlideLabel>

                        {/* Save */}
                        <ButtonWithSlideLabel 
                            className="saveNoteButton ms-2" 
                            label="Save note"
                            title="Save note"
                            disabled={isSaveButtonDisabled()}
                            ref={saveButtonRef}
                            onClickPromise={handleSave}
                        >
                            <i className="fa-solid fa-floppy-disk"></i>
                        </ButtonWithSlideLabel>
                    </Flex>
                </Flex>

                {children}
            </HelperDiv>
        </NoteContext.Provider>
    )
}


export const NoteContext = createContext({
    noteEntity: {} as NoteEntity,

    noteInputs: [<></>],
    setNoteInputs: (noteInputs: JSX.Element[]) => {},

    draggedNoteInputIndex: NaN as number, 
    setDraggedNoteInputIndex: (index: number) => {},
    dragOverNoteInputIndex: NaN as number, 
    setDragOverNoteInputIndex: (index: number) => {},

    createNoteInputByNoteInputType: (noteInputEntity: NoteInputEntity, focusOnRender = false) => {return <></>},

    /**
     * @param edited indicates whether the note entity should be considered edited (```true```) or not edited (hence saved, ``false```). Default is ```true```
     */
    noteEdited: (edited = true) => {},

    gotNewNoteInputs: false as boolean,
    setGotNewNoteInputs: (newNoteInputs: boolean) => {},

    setAreNoteInputsExpanded: (expanded: boolean) => {},
})