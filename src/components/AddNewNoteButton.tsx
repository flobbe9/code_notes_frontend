import React, { useContext } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import HelperProps from "../abstract/HelperProps";
import ButtonWithSlideLabel from "./helpers/ButtonWithSlideLabel";
import { StartPageContentContext } from "./StartPageContent";
import Button from "./helpers/Button";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { isArrayFalsy, log } from "../helpers/utils";
import { AppContext } from "./App";
import { AppUserService } from "../services/AppUserService";
import { isResponseError } from "../helpers/fetchUtils";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
export default function AddNewNoteButton({disabled, onClick, ...props}: Props) {

    const { appUserEntity, toast } = useContext(AppContext);
    const { notes, setNotes, getNoteByNoteEntity, setIsSearchingNotes } = useContext(StartPageContentContext)

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
        const newNoteEntity: NoteEntity = {
            title: "",
            noteInputs: [],
            tags: []
        }

        // update appUser
        // TODO: update cache??
            // make fetch a separate helper
        const appUserEntityCopy = appUserEntity;
        appUserEntityCopy.notes! = [newNoteEntity, ...appUserEntityCopy.notes!];

        const savedAppUserEntity = await AppUserService.fetchSave(appUserEntityCopy);
        // case: fetch error
        if (isResponseError(savedAppUserEntity)) {
            toast("Failed to save note", "An unexpected error occurred. Please try refreshing the page", "error");
            return;
        }

        // will prevent note render from considering search results
        setIsSearchingNotes(false);

        appUserEntity.notes! = [newNoteEntity, ...appUserEntity.notes!];

        // update notes
        const newNote = getNoteByNoteEntity(newNoteEntity);
        setNotes([newNote, ...notes]);
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