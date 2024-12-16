import { NoteEntity } from "../abstract/entites/NoteEntity";
import { AppContext } from "../components/App";
import { StartPageContainerContext } from "../components/routes/StartPageContainer";
import { matchStringsConsiderWhiteSpace } from "./searchUtils";
import { isBlank } from "./utils";


/**
 * Provides helper methods specifically for searching note entities. Needs {@link AppContext} and {@link StartPageContainerContext}.
 * 
 * @since 0.0.1
 */
export class SearchNoteHelper {

    private noteEntities: NoteEntity[];
    
    private selectedTagEntityNames: Set<string>;


    constructor(noteEntities: NoteEntity[], selectedTagEntityNames: Set<string>) {

        this.noteEntities = noteEntities;
        this.selectedTagEntityNames = selectedTagEntityNames;
    }


    public getNoteSearchResults(searchValue: string): NoteEntity[] {

        const selectedTagNames = [...this.selectedTagEntityNames || []];

        // case: no notes
        if (!this.noteEntities.length)
            return [];

        // case: no serach value and no selected tag
        if (isBlank(searchValue) && !selectedTagNames.length)
            return this.noteEntities || [];

        // case: both serach value and selected tag
        if (selectedTagNames.length && !isBlank(searchValue))
            return this.matchAllNoteEntitiesBySearchValueAndSelectedTag(searchValue);

        // case: no selected tags
        if (!selectedTagNames.length)
            return this.matchAllNoteEntitiesBySearchValue(searchValue);

        // case: no search value
        return this.matchAllNoteEntitiesBySelectedTag();
    }
    

    private matchAllNoteEntitiesBySelectedTag(): NoteEntity[] {

        // case: no notes present
        if (!this.noteEntities.length)
            return [];

        return this.noteEntities
            .filter(noteEntity => 
                this.matchNoteEntityBySelectedTagAndNoteTagExactly(this.selectedTagEntityNames, noteEntity));
    }


    private matchAllNoteEntitiesBySearchValue(searchValue: string) {

        // case: falsy search input or no notes present
        if (isBlank(searchValue) || !this.noteEntities.length)
            return [];

        return this.noteEntities
            .filter(noteEntity => 
                // match title
                this.matchNoteEntityBySearchValueAndNoteTitle(searchValue, noteEntity) ||
                // match note tag
                this.matchNoteEntityBySearchValueAndNoteTag(searchValue, noteEntity)
            );
    }


    private matchAllNoteEntitiesBySearchValueAndSelectedTag(searchValue: string): NoteEntity[] {

        // case: falsy search input or no notes present
        if (!this.noteEntities.length)
            return [];

        return this.noteEntities
            .filter(noteEntity => 
                this.matchNoteEntityBySearchValueAndSelectedTag(searchValue, noteEntity));
    }


    /**
     * Match by given ```searchValue``` using {@link matchStringsConsiderWhiteSpace} and by ```noteEntity.tags``` using the ```===``` operator.
     * 
     * @param searchValue 
     * @param noteEntity 
     * @returns 
     */
    private matchNoteEntityBySearchValueAndSelectedTag(searchValue: string, noteEntity: NoteEntity): boolean {

        return (
            // match selected tags with note tags (mandatory criteria)
            this.matchNoteEntityBySelectedTagAndNoteTagExactly(this.selectedTagEntityNames, noteEntity) &&
            // match title
            (this.matchNoteEntityBySearchValueAndNoteTitle(searchValue, noteEntity) ||
            // match note tag
            this.matchNoteEntityBySearchValueAndNoteTag(searchValue, noteEntity))
        );
    }


    /**
     * Match selected tags and ```noteEntity.tags``` using the ```===``` operator.
     * 
     * @param selectedTagNames 
     * @param noteEntity 
     * @returns 
     */
    private matchNoteEntityBySelectedTagAndNoteTagExactly(selectedTagNames: Iterable<string> | null | undefined, noteEntity: NoteEntity): boolean {

        if (!noteEntity || !selectedTagNames)
            return false;

        const selectedTagNameArray = [...selectedTagNames];

        if (!selectedTagNameArray.length)
            return false;

        return selectedTagNameArray
            .filter(selectedTagName => 
                this.matchNoteEntityBySearchValueAndNoteTagExactly(selectedTagName, noteEntity))
            .length === selectedTagNameArray.length;
    }


    /**
     * Match given ```searchValue``` and ```noteEntity.title``` using {@link matchStringsConsiderWhiteSpace}.
     * 
     * @param searchValue 
     * @param noteEntity 
     * @returns 
     */
    private matchNoteEntityBySearchValueAndNoteTitle(searchValue: string, noteEntity: NoteEntity): boolean {

        if (isBlank(searchValue) || !noteEntity)
            return false;

        return matchStringsConsiderWhiteSpace(searchValue, noteEntity.title);
    }


    /**
     * Match given ```searchValue``` and ```noteEntity.tags``` using {@link matchStringsConsiderWhiteSpace}

    *  @param searchValue 
     * @param noteEntity to iterate tags of
     * @returns ```true``` if at least one match was found
     */
    private matchNoteEntityBySearchValueAndNoteTag(searchValue: string, noteEntity: NoteEntity): boolean {

        if (isBlank(searchValue) || !noteEntity || !noteEntity.tags)
            return false;

        return !!noteEntity.tags
            .find(tagEntity => 
                matchStringsConsiderWhiteSpace(searchValue, tagEntity.name));
    }


    /**
     * Look for an exact match of given ```searchValue``` and ```noteEntity.tags``` using the ```===``` operator.
     * 
     * @param searchValue 
     * @param noteEntity to iterate tags of
     * @returns ```true``` if at least one match was found
     */
    private matchNoteEntityBySearchValueAndNoteTagExactly(searchValue: string, noteEntity: NoteEntity): boolean {

        if (isBlank(searchValue) || !noteEntity || !noteEntity.tags)
            return false;

        return !!noteEntity.tags
            .find(tagEntity => 
                searchValue === tagEntity.name);
    }
}