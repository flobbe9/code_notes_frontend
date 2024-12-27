import React, { createContext, Fragment, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteEntity } from "../../../../abstract/entites/NoteEntity";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import { NoteEntityService } from "../../../../abstract/services/NoteEntityService";
import "../../../../assets/styles/Note.scss";
import { DEFAULT_ERROR_MESSAGE } from "../../../../helpers/constants";
import { isResponseError } from "../../../../helpers/fetchUtils";
import { getJsxElementIndexByKey, getRandomString, handleRememberMyChoice, isNumberFalsy, log, logWarn, shortenString } from '../../../../helpers/utils';
import { useHasComponentMounted } from "../../../../hooks/useHasComponentMounted";
import { AppContext } from "../../../App";
import { AppFetchContext } from "../../../AppFetchContextHolder";
import ButtonWithSlideLabel from "../../../helpers/ButtonWithSlideLabel";
import Confirm from "../../../helpers/Confirm";
import Flex from "../../../helpers/Flex";
import HelperDiv from "../../../helpers/HelperDiv";
import Login from "../../Login";
import { StartPageContainerContext } from "../StartPageContainer";
import { StartPageContentContext } from "../StartPageContent";
import AddNewNoteInput from "./AddNewNoteInput";
import CodeNoteInput from "./CodeNoteInput";
import CodeNoteInputWithVariables from "./CodeNoteInputWithVariables";
import DefaultNoteInput from "./DefaultNoteInput";
import NoteTagList from "./NoteTagList";
import NoteTitle from "./NoteTitle";
import PlainTextNoteInput from "./PlainTextNoteInput";
import DefaultCodeNoteInput from "./DefaultCodeNoteInput";


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

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Note");

    const [noteEntity, setNoteEntity] = useState(NoteEntityService.getDefaultInstance());
    const [isNoteInSearchResults, setIsNoteInSearchResults] = useState(true);
    const [noteInputs, setNoteInputs] = useState<JSX.Element[]>([]);

    const { toast, showPopup } = useContext(AppContext);
    const { editedNoteIds, setEditedNoteIds } = useContext(StartPageContainerContext);
    const { 
        appUserEntity, 
        isLoggedIn,
        noteEntities, 
        setNoteEntities, 
        appUserEntityUseQueryResult,
        fetchSaveNoteEntity, 
        fetchDeleteNoteEntity,
    } = useContext(AppFetchContext);
    const { noteSearchResults, notes, setNotes } = useContext(StartPageContentContext);

    const componentRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    const context = {
        noteEntity,

        noteInputs, 
        setNoteInputs,

        createNoteInputByNoteInputType,

        noteEdited
    }

    const hasComponentMounted = useHasComponentMounted();


    
    useEffect(() => {
        if (focusOnRender)
            titleInputRef.current?.focus();

    }, [componentRef.current]);


    useEffect(() => {
        if (!noteInputs.length)
            setNoteInputs(mapNoteInputsToJsx());

    }, [noteEntity]);


    useEffect(() => {
        updateNoteEntity();

    }, [noteEntities]);


    useEffect(() => {
        if (hasComponentMounted)
            setIsNoteInSearchResults(noteSearchResults.includes(noteEntity));

    }, [noteSearchResults]);


    function mapNoteInputsToJsx(): JSX.Element[] {

        if (!noteEntity.noteInputs)
            return [];

        return noteEntity.noteInputs.map(noteInputEntity =>
            createNoteInputByNoteInputType(noteInputEntity));
    }


    function createNoteInputByNoteInputType(noteInputEntity: NoteInputEntity, focusOnRender?): JSX.Element {

        const key = getRandomString();
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
    async function handleSave(event): Promise<void> {

        if (!isLoggedIn) {
            showPopup(<Login isPopupContent />);
            return;
        }
        
        const jsonResponse = await fetchSaveNoteEntity(noteEntity);
        if (isResponseError(jsonResponse)) {
            toast("Failed to save note", DEFAULT_ERROR_MESSAGE, "error");
            return;
        }

        // update saved note in state, update sidebar
        const noteIndex = getJsxElementIndexByKey(notes, propsKey);
        noteEntities.splice(noteIndex, 1, jsonResponse);
        setNoteEntities([...noteEntities]);

        noteEdited(false);

        toast("Save", "Successfully saved note", "success", 5000);
    }


    function handleDeleteNoteClick(event): void {

        if (handleRememberMyChoice("deleteNote", deleteNote))
            return;

        showPopup(
            <Confirm
                heading={<h3>Delete this Note?</h3>}
                message={`Are you sure you want to delete '${shortenString(noteEntity.title)}'?`}
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

        // update note entities
        noteEntities.splice(noteIndex, 1);
        setNoteEntities([...noteEntities]);

        // update notes
        notes.splice(noteIndex, 1);
        setNotes([...notes]);

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

        const noteEntity = noteEntities[noteEntityIndex];
        setNoteEntity(noteEntity)
    }


    return (
        <NoteContext.Provider value={context}>
            <HelperDiv 
                id={id} 
                className={className}
                style={style}
                ref={componentRef}
                rendered={isNoteInSearchResults}
                {...otherProps}
            >
                <div className="contentContainer">
                    <Flex className="fullWidth mb-4" flexWrap="nowrap">
                        {/* Title */}
                        <NoteTitle className="me-1 col-6" ref={titleInputRef} />

                        {/* Tags */}
                        <NoteTagList className="col-6" />
                    </Flex>

                    {/* NoteInputs */}
                    {noteInputs}
                        
                    <AddNewNoteInput className="mt-2 fullWidth" />
                </div>

                <Flex className="mt-4" horizontalAlign="right">
                    {/* Delete */}
                    <ButtonWithSlideLabel 
                        className="me-4 transition deleteNoteButton" 
                        label="Delete Note"
                        labelClassName="ms-2"
                        title="Delete note" 
                        onClick={handleDeleteNoteClick}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </ButtonWithSlideLabel>

                    {/* Save */}
                    <ButtonWithSlideLabel 
                        label="Save Note"
                        labelClassName="ms-2"
                        className="saveNoteButton saveNoteButton" 
                        title="Save note"
                        disabled={isSaveButtonDisabled()}
                        ref={saveButtonRef}
                        onClickPromise={handleSave}
                    >
                        <i className="fa-solid fa-floppy-disk"></i>
                    </ButtonWithSlideLabel>
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
    createNoteInputByNoteInputType: (noteInputEntity: NoteInputEntity, focusOnRender = false) => {return <></>},

    /**
     * @param edited indicates whether the note entity should be considered edited (```true```) or not edited (hence saved, ``false```). Default is ```true```
     */
    noteEdited: (edited = true) => {}
})