import React, { useContext } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import HelperProps from "../abstract/HelperProps";
import ButtonWithSlideLabel from "./helpers/ButtonWithSlideLabel";
import { StartPageContentContext } from "./StartPageContent";
import Button from "./helpers/Button";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { getRandomString, isArrayFalsy } from "../helpers/utils";
import { AppContext } from "./App";
import Note from "./noteInput/Note";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
export default function AddNewNoteButton({disabled, onClick, ...props}: Props) {

    const { appUserEntity } = useContext(AppContext);
    const { notes, setNotes, getNoteByNoteEntity } = useContext(StartPageContentContext)

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteButton", true);


    /**
     * Prepend both a new ```note``` and a new ```noteEntity``` to their corresponding states.
     */
    function prependNote(): void {

        if (isArrayFalsy(appUserEntity.notes))
            appUserEntity.notes = [];

        // create new note entity
        const newNoteEntity = new NoteEntity();
        newNoteEntity.title = "";

        // update appUser
        appUserEntity.notes! = [newNoteEntity, ...appUserEntity.notes!];

        // create new note element
        const newNote = getNoteByNoteEntity(newNoteEntity);
        let newNotes = notes;

        // update notes state
        newNotes = [newNote, ...newNotes];
        setNotes(newNotes);
    }


    function handleClick(event): void {

        if (disabled)
            return;

        if (onClick)
            onClick(event);

        prependNote();
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
                        onClick={handleClick}
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
                        onClick={handleClick}
                        {...otherProps}
                    >
                        <i className="fa-solid fa-plus me-1"></i> New Note

                        {children}
                    </Button>
            }
        </>
    )
}