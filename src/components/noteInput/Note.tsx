import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { NoteEntity } from "../../abstract/entites/NoteEntity";
import { NoteInputEntity } from "../../abstract/entites/NoteInputEntity";
import "../../assets/styles/Note.scss";
import { DEFAULT_ERROR_MESSAGE } from "../../helpers/constants";
import { isResponseError } from "../../helpers/fetchUtils";
import { getJsxElementIndexByKey, getRandomString, isNumberFalsy } from '../../helpers/utils';
import { useHasComponentMounted } from "../../hooks/useHasComponentMounted";
import { AppContext } from "../App";
import { AppFetchContext } from "../AppFetchContextHolder";
import ButtonWithSlideLabel from "../helpers/ButtonWithSlideLabel";
import Confirm from "../helpers/Confirm";
import Flex from "../helpers/Flex";
import HelperDiv from "../helpers/HelperDiv";
import Login from "../Login";
import { StartPageContainerContext } from "../StartPageContainer";
import { StartPageContentContext } from "../StartPageContent";
import { NoteEntityService } from './../../abstract/services/NoteEntityService';
import AddNewNoteInput from "./AddNewNoteInput";
import CodeNoteInput from "./CodeNoteInput";
import CodeNoteInputWithVariables from "./CodeNoteInputWithVariables";
import DefaultCodeNoteInput from "./DefaultCodeNoteInput";
import DefaultNoteInput from "./DefaultNoteInput";
import NoteTagList from "./NoteTagList";
import NoteTitle from "./NoteTitle";
import PlainTextNoteInput from "./PlainTextNoteInput";


interface Props extends DefaultProps {

    /** Assuming that this object is taken from ```appUserEntity```. */
    noteEntity: NoteEntity,

    propsKey: string
}


/**
 * Container containing a list of different ```NoteInput``` components.
 * 
 * @parent ```<StartPageContent>```
 * @since 0.0.1
 */
export default function Note({noteEntity, propsKey, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Note");

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

    const componentRef = useRef(null);
    const saveButtonRef = useRef(null);

    const context = {
        noteEntity,

        noteInputs, 
        setNoteInputs,

        getNoteInputByNoteInputType,

        noteEdited
    }

    const hasComponentMounted = useHasComponentMounted();


    useEffect(() => {
        setNoteInputs(mapNoteInputsToJsx());

    }, []);


    useEffect(() => {
        if (hasComponentMounted)
            setIsNoteInSearchResults(noteSearchResults.includes(noteEntity));

    }, [noteSearchResults]);


    function mapNoteInputsToJsx(): JSX.Element[] {

        if (!noteEntity.noteInputs)
            return [];

        return noteEntity.noteInputs.map(noteInputEntity =>
            getNoteInputByNoteInputType(noteInputEntity));
    }


    function getNoteInputByNoteInputType(noteInputEntity: NoteInputEntity): JSX.Element {

        const key = getRandomString();
        switch (noteInputEntity.type) {
            case "PLAIN_TEXT":
                return (
                    <DefaultNoteInput noteInputEntity={noteInputEntity} propsKey={key} key={key}>
                        <PlainTextNoteInput noteInputEntity={noteInputEntity} />
                    </DefaultNoteInput>
                    )

            case "CODE":
                return (
                    <DefaultCodeNoteInput noteInputEntity={noteInputEntity} propsKey={key} key={key}>
                        <CodeNoteInput noteInputEntity={noteInputEntity} />
                    </DefaultCodeNoteInput>
                )

            case "CODE_WITH_VARIABLES":
                return (
                    <DefaultCodeNoteInput noteInputEntity={noteInputEntity} propsKey={key} key={key}>
                        <CodeNoteInputWithVariables noteInputEntity={noteInputEntity} />
                    </DefaultCodeNoteInput>
                )

            // should not happen
            default: 
                return <div key={key}></div>;
        }
    }


    async function handleSave(event): Promise<void> {

        if (!isLoggedIn) {
            showPopup(<Login isPopupContent />);
            return;
        }

        // case: invalid input
        if (!isNoteValid())
            return;

        const jsonResponse = await fetchSaveNoteEntity(noteEntity);
        if (isResponseError(jsonResponse)) {
            toast("Failed to save note", DEFAULT_ERROR_MESSAGE, "error");
            return;
        }

        // call this before updating side bar, need to get fresh app user tags first
        appUserEntityUseQueryResult.refetch();

        // update sidebar
        setNoteEntities([...noteEntities]);

        noteEdited(false);

        toast("Save", "Successfully saved note", "success", 5000);
    }


    function handleDeleteNoteClick(event): void {

        showPopup(
            <Confirm
                heading={<h3>Delete Note?</h3>}
                message={`Are you sure you want to delete '${noteEntity.title}'?`}
                style={{maxWidth: "50vw"}}
                onConfirm={event => deleteNote()}
            />
        );
    }


    /**
     * Fetch delete notes and update both ```noteEntities``` and ```notes``` state.
     */
    async function deleteNote(): Promise<void> {

        if (!appUserEntity)
            return;
        
        if (isLoggedIn) {
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

        noteEdited(false);
    }


    /**
     * Validate and handle invalid note parts.
     * 
     * @returns ```false``` if at least one part of this ```noteEntity``` is invalid
     */
    function isNoteValid(): boolean {

        return new NoteEntityService().areValidIncludeReferences(toast, noteEntity);
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
                        <NoteTitle className="me-1 col-6" />

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
                        disabled={!editedNoteIds.has(noteEntity.id || -1)}
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
    getNoteInputByNoteInputType: (noteInputEntity: NoteInputEntity, index: number) => {return <></>},

    /**
     * @param edited indicates whether the note entity should be considered edited (```true```) or not edited (hence saved, ``false```). Default is ```true```
     */
    noteEdited: (edited = true) => {}
})