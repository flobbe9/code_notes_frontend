import React, { useContext, useRef } from "react";
import "../../assets/styles/NoteTitle.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { Note } from "../../abstract/entites/NoteEntity";
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

    const { note } = useContext(NoteContext);

    const inputRef = useRef(null);

    
    function handleChange(event): void {

        note.title = $(inputRef.current!).prop("value");
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
                defaultValue={note.title}
                onChange={handleChange}
                ref={inputRef}
            />

            {children}
        </div>
    )
}