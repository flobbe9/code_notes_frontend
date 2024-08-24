import { NoteInputEntityType } from "../NoteInputEntityType";
import { AbstractEntity } from "./AbstractEntity";

/**
 * Class defining an input inside a note as defined in backend. Extends {@link AbstractEntity}.
 * 
 * Equivalent to the ```<Block... />``` components
 * 
 * @since 0.0.1
 */
export class NoteInputEntity extends AbstractEntity {

    value: string;

    type: NoteInputEntityType;

    programmingLanguage?: string | null;
}