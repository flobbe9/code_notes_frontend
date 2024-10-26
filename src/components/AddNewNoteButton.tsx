import React, { useContext } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import HelperProps from "../abstract/HelperProps";
import { DEFAULT_ERROR_MESSAGE } from "../helpers/constants";
import { isResponseError } from "../helpers/fetchUtils";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import ButtonWithSlideLabel from "./helpers/ButtonWithSlideLabel";
import { StartPageContentContext } from "./StartPageContent";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
export default function AddNewNoteButton({disabled, onClick, ...props}: Props) {

    const { toast } = useContext(AppContext);
    const { noteEntities, setNoteEntities, fetchSaveNoteEntity, isLoggedIn } = useContext(AppFetchContext);
    const { notes, setNotes, getNoteByNoteEntity } = useContext(StartPageContentContext)

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
            toast("Failed to save note", DEFAULT_ERROR_MESSAGE, "error");
            return;
        }

        newNoteEntity.id = (jsonResponse as NoteEntity).id;
        newNoteEntity.created = (jsonResponse as NoteEntity).created;

        // update note entities
        setNoteEntities([newNoteEntity, ...noteEntities]);

        // update notes
        setNotes([getNoteByNoteEntity(newNoteEntity, notes.length), ...notes]);
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