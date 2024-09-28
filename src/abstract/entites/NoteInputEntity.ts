import { NoteInputType } from "../NoteInputType";
import { AbstractEntity } from "./AbstractEntity";

/**
 * Interface defining an input inside a note as defined in backend. Extends {@link AbstractEntity}.
 * 
 * Equivalent to the ```<NoteInput... />``` components
 * 
 * @since 0.0.1
 */
export interface NoteInputEntity extends AbstractEntity {

    value: string;

    type: NoteInputType;

    programmingLanguage?: string | null;
}