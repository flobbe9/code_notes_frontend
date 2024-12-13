import React, { MouseEvent, useContext } from "react";
import { ButtonProps } from "../abstract/ButtonProps";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import "../assets/styles/SaveAllNotesButton.scss";
import { isResponseError } from "../helpers/fetchUtils";
import { isNumberFalsy, stringToNumber } from './../helpers/utils';
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import Login from "./Login";
import { StartPageContainerContext } from "./StartPageContainer";


interface Props extends ButtonProps {

}


/**
 * @since 0.0.1
 */
export default function SaveAllNotesButton({...props}: Props) {

    const { toast, showPopup } = useContext(AppContext);
    const { noteEntities, setNoteEntities, isLoggedIn, fetchSaveAllNoteEntities } = useContext(AppFetchContext);
    const { editedNoteIds, setEditedNoteIds } = useContext(StartPageContainerContext);

    const {className, children, ...otherProps} = getCleanDefaultProps(props, "SaveAllNotesButton", true);


    /**
     * Fetch method will validate and toast.
     * 
     * @param event 
     */
    async function handleSave(event: MouseEvent): Promise<void> {
        
        if (!isLoggedIn) {
            showPopup(<Login isPopupContent />);
            return;
        }

        const editedNoteEntitiesAndIndices: Record<number, NoteEntity> = getEditedNoteEntities();

        const jsonResponse = await fetchSaveAllNoteEntities(Object.values(editedNoteEntitiesAndIndices));
        if (isResponseError(jsonResponse))
            // error handled by fetch method
            return;

        // replace unsaved notes with saved ones before updating the state. Assumes that fetch response keeps the order
        Object.entries(editedNoteEntitiesAndIndices)
            .forEach(([noteEntityIndex, noteEntity], i) => 
                noteEntities.splice(stringToNumber(noteEntityIndex), 1, jsonResponse[i]));
        setNoteEntities([...noteEntities]);

        toast("Save all notes", "All notes saved successfully", "success", 4000);

        // mark all notes as "not-edited" for confirm popup to be removed
        setEditedNoteIds(new Set());
    }


    /**
     * @returns object formatted like <noteEntityIndex, noteEntity>. Contains the noteEntities matching ```editedNoteIds``` or having no id (not beeing saved once yet)
     */
    function getEditedNoteEntities(): Record<number, NoteEntity> { 

        if (!noteEntities || !editedNoteIds)
            return [];

        const editedNoteEntitiesAndIndices: Record<number, NoteEntity> = {};

        noteEntities
            .forEach((noteEntity, i) => {
                if (isNumberFalsy(noteEntity.id) || editedNoteIds.has(noteEntity.id!))
                    editedNoteEntitiesAndIndices[i] = noteEntity;
            });

        return editedNoteEntitiesAndIndices;
    }
    

    return (
        <Button 
            className={`${className} hover`} 
            title={props.disabled ? "No changes yet" : "Save all notes"}
            onClickPromise={handleSave}
            {...otherProps}
        >
            <i className="fa-solid fa-floppy-disk me-2"></i> <span>Save all</span>
            {children}
        </Button>
    )
}