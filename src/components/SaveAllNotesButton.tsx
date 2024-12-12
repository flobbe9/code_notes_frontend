import React, { MouseEvent, useContext } from "react";
import { ButtonProps } from "../abstract/ButtonProps";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { NoteEntityService } from "../abstract/services/NoteEntityService";
import "../assets/styles/SaveAllNotesButton.scss";
import { BACKEND_BASE_URL, DEFAULT_ERROR_MESSAGE } from "../helpers/constants";
import fetchJson, { isResponseError } from "../helpers/fetchUtils";
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
    const { noteEntities, isLoggedIn } = useContext(AppFetchContext);
    const { editedNoteIds, setEditedNoteIds } = useContext(StartPageContainerContext);

    const {className, children, ...otherProps} = getCleanDefaultProps(props, "SaveAllNotesButton", true);


    async function handleSave(event: MouseEvent): Promise<void> {
        
        if (!isLoggedIn) {
            showPopup(<Login isPopupContent />);
            return;
        }

        if (!areNotesValid())
            // handled by areNotesValid()
            return;

        const editedNotes = getNoteEntitiesByIds();

        const url = `${BACKEND_BASE_URL}/note/save-all`;
        const jsonResponse = await fetchJson(url, "post", editedNotes);

        if (isResponseError(jsonResponse)) {
            toast("Failed to save notes", DEFAULT_ERROR_MESSAGE, "error");
            return;
        }

        toast("Save all notes", "All notes saved successfully", "success", 4000);

        // mark all notes as "not-edited" for confirm popup to be removed
        setEditedNoteIds(new Set());
    }


    function getNoteEntitiesByIds(): NoteEntity[] {

        if (!noteEntities || !editedNoteIds)
            return [];

        return noteEntities
            .filter(noteEntity => editedNoteIds.has(noteEntity.id || -1));
    }


    /**
     * Validate and handle invalid note parts.
     * 
     * @returns ```false``` if at least one part of this ```noteEntity``` is invalid
     */
    function areNotesValid(): boolean {

        return new NoteEntityService().areValidIncludeReferences(toast, ...noteEntities);
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