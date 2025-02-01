import React, { MouseEvent, useContext, useEffect, useState } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import HelperProps from "../abstract/HelperProps";
import { isResponseError } from "../helpers/fetchUtils";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import { StartPageContentContext } from "./routes/startPageContainer/StartPageContent";
import { AppContext } from "./App";
import { NoteEntityService } from "../abstract/services/NoteEntityService";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
export default function AddNewNoteButton({onClick, ...props}: Props) {

    const [isDisabled, setIsDisabled] = useState(props.disabled);

    const { toast } = useContext(AppContext);
    const { editedNoteEntities, setEditedNoteEntities, isLoggedIn, fetchSaveNoteEntity, notesUseQueryResult, noteSearchResults } = useContext(AppFetchContext);
    const { setIsFocusFirstNote } = useContext(StartPageContentContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteButton", true);


    useEffect(() => {
        setIsDisabled((isLoggedIn && !!editedNoteEntities.length) || props.disabled);

    }, [editedNoteEntities, isLoggedIn, props.disabled]);


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

        if (noteSearchResults || !isLoggedIn) {
            // set focus first to true
            setEditedNoteEntities([newNoteEntity, ...editedNoteEntities]);
            
        } else
            notesUseQueryResult.refetch();

        setIsFocusFirstNote(true);
    }


    async function handleClick(event: MouseEvent): Promise<void> {

        if (isDisabled)
            return;

        if (onClick)
            onClick(event);

        await prependNote();
    }


    return (
        <Button
            id={id} 
            className={className + " hover"}
            style={style}
            disabled={isDisabled}
            title={`${isDisabled ? 'Please save your pending changes first' : 'Add a new note'}`}
            onClickPromise={handleClick}
            {...otherProps}
        >
            <i className="fa-solid fa-plus me-2"></i> <span>New note</span>

            {children}
        </Button>
    )
}