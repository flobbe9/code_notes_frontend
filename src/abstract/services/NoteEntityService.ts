import { MAX_NOTE_TITLE_VALUE_LENGTH } from "../../helpers/constants";
import { logWarn } from "../../helpers/utils";
import { NoteEntity } from "../entites/NoteEntity";
import { AbstractService } from "./AbstractService";
import { NoteInputEntityService } from "./NoteInputEntityService";
import { TagEntityService } from "./TagEntityService";


/**
 * @since 0.0.1
 */
export class NoteEntityService extends AbstractService {

    protected isValid(noteEntity: NoteEntity): boolean {

        if (!noteEntity)
            return false;

        return noteEntity.title.length <= MAX_NOTE_TITLE_VALUE_LENGTH;
    }

    
    protected handleInvalid(i: number, toast: CallableFunction): void {

        if (!toast) {
            logWarn("Invalid args");
            return;
        }

        toast("Note title invalid", `The note title cannot be longer than ${MAX_NOTE_TITLE_VALUE_LENGTH} characters.`, "warn");
    }

    
    /**
     * Validate given ```noteEntity``` and all referenced fields, calling their corresponding handlers if they're invalid.
     * 
     * @param noteEntity to validate
     * @param toast exact same function from "App.tsx" in order to show small popup if invalid
     * @returns ```false``` if at least one reference or part of the note is invalid, else ```true```
     */
    public isValidIncludeReferences(noteEntity: NoteEntity, toast: CallableFunction): boolean {

        if (!noteEntity)
            return false;

        const noteEntityService = new NoteEntityService();
        const tagEntityService = new TagEntityService();
        const noteInputEntityService = new NoteInputEntityService();

        return noteEntityService.areEntitiesValid([noteEntity], toast) &&
                tagEntityService.areEntitiesValid(noteEntity.tags || [], toast) && 
                noteInputEntityService.areEntitiesValid(noteEntity.noteInputs || [], toast);
    }
    

    /**
     * Call {@link isValidIncludeReferences} on each of given notes.
     * 
     * @param toast exact same function from "App.tsx" in order to show small popup if invalid
     * @param noteEntities to validate
     * @returns ```false``` if at least one note is invalid, else ```true```
     */
    public areValidIncludeReferences(toast: CallableFunction, ...noteEntities: NoteEntity[]): boolean {

        if (!noteEntities)
            return false;

        return !noteEntities
            .find(noteEntity => 
                !this.isValidIncludeReferences(noteEntity, toast));
    }
}