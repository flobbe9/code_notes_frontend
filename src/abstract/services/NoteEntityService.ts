import { MAX_NOTE_TITLE_VALUE_LENGTH } from "../../helpers/constants";
import { isNumberFalsy, logWarn } from "../../helpers/utils";
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
        

    /**
     * @returns instance with default values (mostly ```null```)
     */
    public static getDefaultInstance(): NoteEntity {

        return {
            id: null,
            created: "",
            updated: "",
            tags: null,
            title: "",
            noteInputs: null,
        };
    }

    
    protected handleInvalid(i: number, toast: CallableFunction): void {

        if (!toast) {
            logWarn("Invalid args");
            return;
        }

        toast(`Note ${i + 1} invalid title`, `The note title cannot be longer than ${MAX_NOTE_TITLE_VALUE_LENGTH} characters.`, "warn");
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
     * @param editedNoteEntities to validate
     * @returns ```false``` if at least one note is invalid, else ```true```
     */
    public areValidIncludeReferences(toast: CallableFunction, ...editedNoteEntities: NoteEntity[]): boolean {

        if (!editedNoteEntities)
            return false;

        return !editedNoteEntities
            .find(noteEntity => 
                !this.isValidIncludeReferences(noteEntity, toast));
    }


    /**
     * @param noteEntities to search in
     * @param id to find
     * @returns true if at least one noteEntitiy in given ```noteEntities``` has given ```id```
     */
    public static includesById(noteEntities: NoteEntity[], id: number): boolean {

        if (!noteEntities || !noteEntities.length || isNumberFalsy(id))
            return false;

        return !!noteEntities
            .find(noteEntity => noteEntity.id === id);
    }


    /**
     * @param noteEntities to remove a noteEntity in
     * @param id of the noteEntity to remove
     * @returns the removed noteEntity or ```null``` if it was not included
     */
    public static removeById(noteEntities: NoteEntity[], id: number): NoteEntity | null {

        if (!noteEntities || !noteEntities.length || isNumberFalsy(id))
            return null;

        const noteEntityIndex = this.findByIdAndGetIndex(noteEntities, id)[1];

        if (noteEntityIndex === -1)
            return null;

        return noteEntities.splice(noteEntityIndex, 1)[0];
    }


    public static findById(noteEntities: NoteEntity[], id: number): NoteEntity | null {

        return this.findByIdAndGetIndex(noteEntities, id)[0];
    }


    /**
     * @param noteEntities 
     * @param id 
     * @returns ```[noteEntity, index]``` or ```[null, -1]``` if no noteEntity with given ```id```
     */
    private static findByIdAndGetIndex(noteEntities: NoteEntity[], id: number): [NoteEntity | null, number] {

        if (!noteEntities || !noteEntities.length || isNumberFalsy(id))
            return [null, -1];

        let index = -1;
        let resultNoteEntity: NoteEntity | null = null;

        noteEntities
            .find((noteEntity, i) => {
                const isMatch = noteEntity.id === id;
                if (isMatch) {
                    index = i;
                    resultNoteEntity = noteEntity
                }

                return isMatch;
            });

        return [resultNoteEntity, index];
    }
}