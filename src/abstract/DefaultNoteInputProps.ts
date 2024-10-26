import DefaultProps from "./DefaultProps";
import { NoteInputEntity } from "./entites/NoteInputEntity";


/**
 * @since 0.0.1
 */
export interface DefaultNoteInputProps extends DefaultProps {
    
    noteInputEntity: NoteInputEntity,

    propsKey: string
}