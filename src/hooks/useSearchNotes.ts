import { useContext } from "react";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { AppContext } from "../components/App";
import { StartPageContainerContext } from "../components/StartPageContainer";
import { matchStringsConsiderWhiteSpace } from "../helpers/searchUtils";
import { isBlank } from "../helpers/utils";


/**
 * Provides helper methods specifically for searching note entities. Needs {@link AppContext} and {@link StartPageContainerContext}.
 * 
 * @since 0.0.1
 */
export function useSearchNotes() {

    const { appUserEntity } = useContext(AppContext);
    const { selectedTagEntityNames } = useContext(StartPageContainerContext);


    function getNoteSearchResults(searchValue: string): NoteEntity[] {

        const selectedTagNames = [...selectedTagEntityNames || []];

        // case: no notes
        if (!appUserEntity.notes)
            return appUserEntity.notes || [];

        // case: no serach value and no selected tag
        if (isBlank(searchValue) && !selectedTagNames.length)
            return appUserEntity.notes || [];

        // case: both serach value and selected tag
        if (selectedTagNames.length && !isBlank(searchValue))
            return matchAllNoteEntitiesBySearchValueAndSelectedTag(searchValue);

        // case: no selected tags
        if (!selectedTagNames.length)
            return matchAllNoteEntitiesBySearchValue(searchValue);

        // case: no search value
        return matchAllNoteEntitiesBySelectedTag();
    }
    

    function matchAllNoteEntitiesBySelectedTag(): NoteEntity[] {

        // case: falsy search input or no notes present
        if (!appUserEntity.notes)
            return appUserEntity.notes || [];

        return appUserEntity.notes
            .filter(noteEntity => 
                matchNoteEntityBySelectedTagAndNoteTagExactly(selectedTagEntityNames, noteEntity));
    }


    function matchAllNoteEntitiesBySearchValue(searchValue: string) {

        // case: falsy search input or no notes present
        if (isBlank(searchValue) || !appUserEntity.notes)
            return appUserEntity.notes || [];

        return appUserEntity.notes
            .filter(noteEntity => 
                // match title
                matchNoteEntityBySearchValueAndNoteTitle(searchValue, noteEntity) ||
                // match note tag
                matchNoteEntityBySearchValueAndNoteTag(searchValue, noteEntity)
            );
    }


    function matchAllNoteEntitiesBySearchValueAndSelectedTag(searchValue: string): NoteEntity[] {

        // case: falsy search input or no notes present
        if (!appUserEntity.notes)
            return appUserEntity.notes || [];

        return appUserEntity.notes
            .filter(noteEntity => 
                matchNoteEntityBySearchValueAndSelectedTag(searchValue, noteEntity));
    }


    /**
     * Match by given ```searchValue``` using {@link matchStringsConsiderWhiteSpace} and by ```noteEntity.tags``` using the ```===``` operator.
     * 
     * @param searchValue 
     * @param noteEntity 
     * @returns 
     */
    function matchNoteEntityBySearchValueAndSelectedTag(searchValue: string, noteEntity: NoteEntity): boolean {

        return (
            // match selected tags with note tags (mandatory criteria)
            matchNoteEntityBySelectedTagAndNoteTagExactly(selectedTagEntityNames, noteEntity) &&
            // match title
            (matchNoteEntityBySearchValueAndNoteTitle(searchValue, noteEntity) ||
            // match note tag
            matchNoteEntityBySearchValueAndNoteTag(searchValue, noteEntity))
        );
    }


    /**
     * Match selected tags and ```noteEntity.tags``` using the ```===``` operator.
     * 
     * @param selectedTagNames 
     * @param noteEntity 
     * @returns 
     */
    function matchNoteEntityBySelectedTagAndNoteTagExactly(selectedTagNames: Iterable<string> | null | undefined, noteEntity: NoteEntity): boolean {

        if (!noteEntity || !selectedTagNames)
            return false;

        const selectedTagNameArray = [...selectedTagNames];

        if (!selectedTagNameArray.length)
            return false;

        return selectedTagNameArray
            .filter(selectedTagName => 
                matchNoteEntityBySearchValueAndNoteTagExactly(selectedTagName, noteEntity))
            .length === selectedTagNameArray.length;
    }


    /**
     * Match given ```searchValue``` and ```noteEntity.title``` using {@link matchStringsConsiderWhiteSpace}.
     * 
     * @param searchValue 
     * @param noteEntity 
     * @returns 
     */
    function matchNoteEntityBySearchValueAndNoteTitle(searchValue: string, noteEntity: NoteEntity): boolean {

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
    function matchNoteEntityBySearchValueAndNoteTag(searchValue: string, noteEntity: NoteEntity): boolean {

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
    function matchNoteEntityBySearchValueAndNoteTagExactly(searchValue: string, noteEntity: NoteEntity): boolean {

        if (isBlank(searchValue) || !noteEntity || !noteEntity.tags)
            return false;

        return !!noteEntity.tags
            .find(tagEntity => 
                searchValue === tagEntity.name);
    }


    return { getNoteSearchResults };
}