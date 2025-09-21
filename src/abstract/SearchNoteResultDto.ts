import { NoteEntity } from "./entites/NoteEntity";

/**
 * Expected response object when fetching note search.
 * 
 * @since latest
 */
export class SearchNoteResultDto {
    /** The paginated search results */
    results: NoteEntity[];
    /** The total number of search results */
    totalResults: number

    static emptyInstance(): SearchNoteResultDto {
        return {
            results: [],
            totalResults: 0
        }
    }
}