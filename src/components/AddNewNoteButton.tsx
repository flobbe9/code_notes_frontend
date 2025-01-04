import React, { MouseEvent, useContext } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import HelperProps from "../abstract/HelperProps";
import { isResponseError } from "../helpers/fetchUtils";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import { StartPageContentContext } from "./routes/startPageContainer/StartPageContent";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
export default function AddNewNoteButton({disabled, onClick, ...props}: Props) {

    const { editedNoteIds } = useContext(AppContext);
    const { noteEntities, setNoteEntities, isLoggedIn, fetchSaveNoteEntity, noteUseQueryResult, noteSearchResults } = useContext(AppFetchContext);
    const { notes, setNotes, createNoteByNoteEntity, setIsFocusFirstNote } = useContext(StartPageContentContext)

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteButton", true);


    /**
     * Prepend a new ```note``` to both ```noteEntities``` and ```notes``` and save it. 
     */
    async function prependNote(): Promise<void> {

        let newNoteEntity: NoteEntity = {
            title: "",
            noteInputs: [],
            tags: []
        }

        if (isLoggedIn) {
            const jsonResponse = await fetchSaveNoteEntity(newNoteEntity);
            if (isResponseError(jsonResponse))
                return;
            
            newNoteEntity = jsonResponse;
        }

        if (editedNoteIds.size || noteSearchResults || !isLoggedIn) {
            // set focus first to true
            setNoteEntities([newNoteEntity, ...noteEntities]);
            setNotes([createNoteByNoteEntity(newNoteEntity, true), ...notes]);
            
        } else
            noteUseQueryResult.refetch();

        setIsFocusFirstNote(true);
    }


    async function handleClick(event: MouseEvent): Promise<void> {

        if (disabled)
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
            onClickPromise={handleClick}
            {...otherProps}
        >
            <i className="fa-solid fa-plus me-2"></i> <span>New note</span>

            {children}
        </Button>
    )
}