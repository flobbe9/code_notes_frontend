import React, { MouseEvent, useContext } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import HelperProps from "../abstract/HelperProps";
import { NoteEntityService } from "../abstract/services/NoteEntityService";
import { isResponseError } from "../helpers/fetchUtils";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextProvider";
import Button from "./helpers/Button";
import { StartPageContentContext } from "./routes/startPageContainer/StartPageContent";


interface Props extends HelperProps {

}

/**
 * @since 0.0.1
 */
export default function AddNewNoteButton({onClick, ...props}: Props) {
    const { toast } = useContext(AppContext);
    const { editedNoteEntities, setEditedNoteEntities, isLoggedIn, fetchSaveNoteEntity, notesUseQueryResult } = useContext(AppFetchContext);
    const { setIsFocusFirstNote, isEditingNotes, isSearchingNotes } = useContext(StartPageContentContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteButton", true);

    /**
     * Prepend a new ```note``` to both ```editedNoteEntities``` and ```notes``` and save it. Dont add if there's unsaved notes.
     */
    async function prependNote(): Promise<void> {
        if (editedNoteEntities.length && isLoggedIn) {
            toast("Add new note", "Please save your pending changes before adding a new note", "warn", 8000);
            return;
        }

        let newNoteEntity: NoteEntity = NoteEntityService.getDefaultInstance();

        if (isLoggedIn) {
            const jsonResponse = await fetchSaveNoteEntity(newNoteEntity);
            if (isResponseError(jsonResponse))
                return;
            
            newNoteEntity = jsonResponse;
        }

        if (!isLoggedIn) {
            // set focus first to true
            setEditedNoteEntities([newNoteEntity, ...editedNoteEntities]);
            
        } else
            notesUseQueryResult.refetch();

        setIsFocusFirstNote(true);
    }

    async function handleClick(event: MouseEvent): Promise<void> {
        if (props.disabled)
            return;

        if (onClick)
            onClick(event);

        await prependNote();
    }

    function getTitle(): string {
        const isSearchingMessage = "clear all search filters";
        const isEditingMessage = "save your pending changes";

        if (isEditingNotes() && isSearchingNotes())
            return `Please ${isEditingMessage} first and ${isSearchingMessage}.`;

        if (isEditingNotes())
            return `Please ${isEditingMessage} first.`;

        if (isSearchingNotes())
            return `Please ${isSearchingMessage} first.`;

        return 'Add a new note';
    }

    return (
        <Button
            id={id} 
            className={className + " hover"}
            style={style}
            title={getTitle()}
            onClickPromise={handleClick}
            {...otherProps}
        >
            <i className="fa-solid fa-plus me-2"></i> <span>New note</span>

            {children}
        </Button>
    )
}
