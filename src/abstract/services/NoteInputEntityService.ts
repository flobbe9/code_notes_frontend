import { NoteInputEntity } from "../entites/NoteInputEntity";
import { MAX_NOTE_INPUT_VALUE_LENGTH } from "../../helpers/constants";
import { AbstractService } from "./AbstractService";


/**
 * @since 0.0.1
 */
export class NoteInputEntityService extends AbstractService {

    noteInputEntities: NoteInputEntity[] | null;


    constructor(noteInputEntities: NoteInputEntity[] | null) {

        super(noteInputEntities || []);
        this.noteInputEntities = noteInputEntities;
    }


    isEntityValid(noteInputEntity: NoteInputEntity): boolean {

        if (!noteInputEntity)
            return false;

        return noteInputEntity.value.length <= MAX_NOTE_INPUT_VALUE_LENGTH;
    }
}