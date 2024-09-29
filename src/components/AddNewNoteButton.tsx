import React, { useContext } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import HelperProps from "../abstract/HelperProps";
import ButtonWithSlideLabel from "./helpers/ButtonWithSlideLabel";
import { StartPageContentContext } from "./StartPageContent";
import Button from "./helpers/Button";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { isArrayFalsy, log } from "../helpers/utils";
import { AppContext } from "./App";
import { isResponseError } from "../helpers/fetchUtils";
import { AppFetchContext } from "./AppFetchContextHolder";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
export default function AddNewNoteButton({disabled, onClick, ...props}: Props) {

    const { toast } = useContext(AppContext);
    const { noteEntities, setNoteEntities, fetchSaveNoteEntity, isLoggedIn } = useContext(AppFetchContext);
    const { notes, setNotes, getNoteByNoteEntity, setIsSearchingNotes } = useContext(StartPageContentContext)

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteButton", true);


    /**
     * Prepend both a new ```note``` and a new ```noteEntity``` to their corresponding states.
     */
    async function prependNote(): Promise<void> {

        // create new note entity
        const newNoteEntity: NoteEntity = {
            title: "",
            noteInputs: [],
            tags: []
        }

        // wont save if not logged in but that's fine here
        const jsonResponse = await fetchSaveNoteEntity(newNoteEntity);

        // only point out fetch error if is logged in
        if (isResponseError(jsonResponse) && isLoggedIn) {
            toast("Failed to save note", "An unexpected error occurred. Please try refreshing the page", "error");
            return;
        }

        newNoteEntity.id = (jsonResponse as NoteEntity).id;
        newNoteEntity.created = (jsonResponse as NoteEntity).created;

        // will prevent note render from considering search results
        setIsSearchingNotes(false);

        // update note entities
        setNoteEntities([newNoteEntity, ...noteEntities]);

        // update notes
        setNotes([getNoteByNoteEntity(newNoteEntity), ...notes]);
    }


    async function handleClick(event: React.MouseEvent<any, MouseEvent>): Promise<void> {

        if (disabled)
            return;

        if (onClick)
            onClick(event);

        await prependNote();
    }


    return (
        <>
            {
                notes.length ? 
                    <ButtonWithSlideLabel 
                        id={id} 
                        className={className}
                        style={style}
                        label="New note"
                        onClickPromise={handleClick}
                        {...otherProps}
                        
                    >
                        <i className="fa-solid fa-plus"></i>

                        {children}
                    </ButtonWithSlideLabel>
                    :
                    <Button
                        id={id} 
                        className={className + " fullWidth"}
                        style={style}
                        onClickPromise={handleClick}
                        {...otherProps}
                    >
                        <i className="fa-solid fa-plus me-1"></i> New Note

                        {children}
                    </Button>
            }
        </>
    )
}