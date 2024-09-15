import React, { useContext } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import HelperProps from "../abstract/HelperProps";
import ButtonWithSlideLabel from "./helpers/ButtonWithSlideLabel";
import { StartPageContentContext } from "./StartPageContent";
import Button from "./helpers/Button";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { isArrayFalsy } from "../helpers/utils";
import { AppContext } from "./App";
import { AppUserService } from "../services/AppUserService";


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
    async function prependNote(): Promise<void> {

        if (!appUserEntity)
            return;

        if (isArrayFalsy(appUserEntity.notes))
            appUserEntity.notes = [];

        // create new note entity
        const newNoteEntity = new NoteEntity();
        newNoteEntity.title = "";

        // update appUser
        appUserEntity.notes! = [newNoteEntity, ...appUserEntity.notes!];
        await AppUserService.fetchSave(appUserEntity);

        // create new note element
        const newNote = getNoteByNoteEntity(newNoteEntity);
        let newNotes = notes;

        // update notes state
        newNotes = [newNote, ...newNotes];
        setNotes(newNotes);
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