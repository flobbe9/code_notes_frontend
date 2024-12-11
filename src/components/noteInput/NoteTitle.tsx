import $ from "jquery";
import React, { useContext, useRef } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import "../../assets/styles/NoteTitle.scss";
import { INVALID_INPUT_CLASS_NAME, MAX_NOTE_TITLE_VALUE_LENGTH } from "../../helpers/constants";
import { isEventKeyTakingUpSpace } from "../../helpers/utils";
import { AppContext } from "../App";
import { NoteContext } from "./Note";


interface Props extends DefaultProps {

}


/**
 * Container component for what is referred to as "Note" for the user. Contains list of noteInputs, the noteInput title,
 * the noteInput tags etc. 
 * 
 * @since 0.0.1
 */
export default function NoteTitle({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "NoteTitle");

    const { toast, isControlKeyPressed } = useContext(AppContext);
    const { noteEntity, noteEdited } = useContext(NoteContext);

    const inputRef = useRef(null);

    
    function handleChange(event): void {

        noteEntity.title = $(inputRef.current!).prop("value");

        noteEdited();
    }


    function handleKeyDown(event): void {

        if (isEventKeyTakingUpSpace(event.key, false) && !isControlKeyPressed() && isTitleValueTooLong(event))
            handleTitleTooLong(event);
    }


    /**
     * @param event the key down event (assuming that the key has not yet been added to the input value)
     * @returns ```true``` if the note title's value is longer than {@link MAX_NOTE_TITLE_VALUE_LENGTH}
     */
    function isTitleValueTooLong(event): boolean {

        const noteInput = $(inputRef.current!);
        const noteInputValue = noteInput.prop("value") + event.key;

        return noteInputValue.length > MAX_NOTE_TITLE_VALUE_LENGTH;
    }


    /**
     * Prevent given key event and toast warn about text length.
     * 
     * @param event the key event that triggered this method
     */
    function handleTitleTooLong(event: Event): void {

        event.preventDefault();

        toggleTitleInvalid();

        toast("Note title too long", "A note title cannot have more than " + MAX_NOTE_TITLE_VALUE_LENGTH + " characters.", "warn", 7000);
    }


    /**
     * Add the {@link INVALID_INPUT_CLASS_NAME} class to this input for given ```duration```.
     * 
     * @param duration the time in ms to keep the {@link INVALID_INPUT_CLASS_NAME} class before removing it again
     */
    function toggleTitleInvalid(duration = 300): void {

        // get element
        const noteTitle = $(inputRef.current!);

        noteTitle.addClass(INVALID_INPUT_CLASS_NAME);

        setTimeout(() => {
            noteTitle.removeClass(INVALID_INPUT_CLASS_NAME);
        }, duration);
    }


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            <input 
                className="titleInput" 
                type="text" 
                title="Note title"
                placeholder="Note title..."
                defaultValue={noteEntity.title}
                maxLength={MAX_NOTE_TITLE_VALUE_LENGTH}
                ref={inputRef}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
            />

            {children}
        </div>
    )
}