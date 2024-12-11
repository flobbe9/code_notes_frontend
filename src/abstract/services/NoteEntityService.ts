import { MAX_NOTE_TITLE_VALUE_LENGTH } from "../../helpers/constants";
import { NoteEntity } from "../entites/NoteEntity";


/**
 * @since 0.0.1
 */
export class NoteEntityService {

    noteEntity: NoteEntity;


    constructor(noteEntity: NoteEntity) {

        this.noteEntity = noteEntity;
    }


    /**
     * Will not validate the notes child entities but only it's primitive fields.
     * 
     * @param noteEntity to validate
     * @returns see super impl
     */
    isEntityValid(invalidHandler: () => void): boolean {

        if (!this.noteEntity)
            return false;

        if (this.noteEntity.title.length > MAX_NOTE_TITLE_VALUE_LENGTH) {
            invalidHandler();
            return false;
        }

        return true;
    }
}