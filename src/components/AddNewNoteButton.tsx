import React, { MouseEvent, useContext } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import HelperProps from "../abstract/HelperProps";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import { StartPageContentContext } from "./routes/startPageContainer/StartPageContent";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
export default function AddNewNoteButton({disabled, onClick, ...props}: Props) {

    const { noteEntities, setNoteEntities } = useContext(AppFetchContext);
    const { notes, setNotes, getNoteByNoteEntity } = useContext(StartPageContentContext)

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteButton", true);


    /**
     * Prepend a new ```note``` to both ```noteEntities``` and ```notes``` but don't save.
     */
    async function prependNote(): Promise<void> {

        const newNoteEntity: NoteEntity = {
            title: "",
            noteInputs: [],
            tags: []
        }

        setNoteEntities([newNoteEntity, ...noteEntities]);

        setNotes([getNoteByNoteEntity(newNoteEntity, notes.length), ...notes]);
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