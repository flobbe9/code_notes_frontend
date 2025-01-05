import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppUserEntity } from '../abstract/entites/AppUserEntity';
import { NoteEntity } from '../abstract/entites/NoteEntity';
import { CustomExceptionFormatService } from "../abstract/services/CustomExceptionFormatService";
import { NoteEntityService } from "../abstract/services/NoteEntityService";
import { AppContext } from "../components/App";
import { BACKEND_BASE_URL, DEFAULT_ERROR_MESSAGE, NUM_NOTES_PER_PAGE } from "../helpers/constants";
import fetchJson, { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { isNumberFalsy, jsonParseDontThrow, logWarn, scrollTop } from "../helpers/utils";
import { useIsFetchTakingLong } from "./useIsFetchTakingLong";


export function useNotes(isLoggedIn: boolean, appUserEntity: AppUserEntity) {

    const [noteEntities, setNoteEntities] = useState<NoteEntity[]>([]);
    /** Global search results. Should be set to ```undefined``` if there's no search query */
    const [noteSearchResults, setNoteSearchResults] = useState<NoteEntity[] | undefined>(undefined);
    /** Is a toggle state, meaning that the boolean does not reflect the states meaning. Implies (on change) that new data has been fetched */
    const [gotNewData, setGotNewData] = useState(false);

    /** 1-based */
    const [currentPage, setCurrentPage] = useState(1);

    const { toast, setEditedNoteIds } = useContext(AppContext);

    const queryClient = useQueryClient();

    const useQueryResult = useQuery<NoteEntity[]>({
        queryKey: NOTE_QUERY_KEY,
        queryFn: fetchNotes,
        initialData: queryClient.getQueryData(NOTE_QUERY_KEY) || []
    });


    /** The time (in milliseconds) the note entities' fetch process may take before considering the process "taking longer" */
    const noteEntitiesFetchDelay = 1000;
    const isFetchTakingLonger = useIsFetchTakingLong(useQueryResult.isFetched, noteEntitiesFetchDelay, !useQueryResult.isFetched);

    
    useEffect(() => {
        if (useQueryResult.data && !getUnsavedNoteEntities().length) {
            setNoteEntities(getNoteEntitiesPage());
            // this is to notify the component to map all notes again
            setGotNewData(!gotNewData);
        }

    }, [useQueryResult.data, noteSearchResults]);


    useEffect(() => {
        // page change will refetch forgetting unsaved changes
        refetchNotesAndUpdateState();
        setTimeout(() => scrollTop(), 10); // don't ask me
        setEditedNoteIds(new Set());

    }, [currentPage]);


    useEffect(() => {
        if (isLoggedIn && appUserEntity)
            useQueryResult.refetch();

    }, [isLoggedIn, appUserEntity]);


    useEffect(() => {
        handleUnsavedNotesTransfer();
            
    }, [isLoggedIn]);


    async function fetchNotes(): Promise<NoteEntity[]> {

        if (!isLoggedIn || !appUserEntity)
            return [];

        const url = `${BACKEND_BASE_URL}/note/get-all-by-appUser`;

        const jsonResponse = await fetchJson(url);
        if (isResponseError(jsonResponse)) {
            toast("Failed to load notes", DEFAULT_ERROR_MESSAGE, "error");
            return [];
        }

        return jsonResponse;
    }


    /**
     * Refetch and update states regardless of whether the data has changed or not.
     * 
     * @returns fetched data, just like ```fetchNotes```
     */
    async function refetchNotesAndUpdateState(): Promise<NoteEntity[]> {
        
        if (!isLoggedIn || !appUserEntity)
            return [];

        const jsonResponse = await useQueryResult.refetch();

        if (isResponseError(jsonResponse))
            return useQueryResult.data;

        setNoteEntities(getNoteEntitiesPage());
        setGotNewData(!gotNewData);

        return jsonResponse.data || [];
    }


    /**
     * Save given ```noteEntity``` or return error obj. Will toast on fetch error.
     * 
     * @param noteEntity to save
     * @returns the saved note entity or an error obj
     */
    async function fetchSave(noteEntity: NoteEntity): Promise<NoteEntity | CustomExceptionFormat> {

        if (!noteEntity)
            return CustomExceptionFormatService.getInstanceAndLog(500, "Failed to save note entity. 'noteEntity' cannot be falsy");

        if (!isLoggedIn)
            return CustomExceptionFormatService.getInstanceAndLog(401, "Failed to save note entity. UNAUTHORIZED");

        if (!new NoteEntityService().areValidIncludeReferences(toast, noteEntity))
            return CustomExceptionFormatService.getInstanceAndLog(400, "Failed to save note entity. BAD_REQUEST");

        const url = `${BACKEND_BASE_URL}/note/save`;

        const jsonResponse = await fetchJson(url, "post", noteEntity);

        if (isResponseError(jsonResponse)) {
            toast("Failed to save note", DEFAULT_ERROR_MESSAGE, "error");
            return CustomExceptionFormatService.getInstance(jsonResponse.status, jsonResponse.message);
        }

        return jsonResponse;
    }


    /**
     * Save given ```noteEntities``` or return error obj. Will toast on fetch error.
     * 
     * @param noteEntities to save
     * @returns the saved note entity or an error obj
     */
    async function fetchSaveAll(noteEntities: NoteEntity[]): Promise<NoteEntity[] | CustomExceptionFormat> {

        if (!noteEntities)
            return CustomExceptionFormatService.getInstanceAndLog(500, "Failed to save note entities. 'noteEntity' cannot be falsy");

        if (!isLoggedIn)
            return CustomExceptionFormatService.getInstanceAndLog(401, "Failed to save note entities. UNAUTHORIZED");

        if (!noteEntities.length)
            return CustomExceptionFormatService.getInstanceAndLog(204, "Failed to save note entities. NO_CONTENT");

        if (!new NoteEntityService().areValidIncludeReferences(toast, ...noteEntities))
            return CustomExceptionFormatService.getInstanceAndLog(400, "Failed to save note entity. BAD_REQUEST");

        const url = `${BACKEND_BASE_URL}/note/save-all`;
        const jsonResponse = await fetchJson(url, "post", noteEntities);

        if (isResponseError(jsonResponse)) {
            toast("Failed to save notes", DEFAULT_ERROR_MESSAGE, "error");
            return CustomExceptionFormatService.getInstance(jsonResponse.status, jsonResponse.message);
        }

        return jsonResponse;
    } 


    async function fetchDelete(noteEntity: NoteEntity): Promise<CustomExceptionFormat | Response> {

        const defaultErrorMessage = "Failed to delete note.";

        if (!noteEntity)
            return CustomExceptionFormatService.getInstanceAndLog(500, `${defaultErrorMessage} 'noteEntity' cannot be falsy`);
        
        if (!isLoggedIn)
            return CustomExceptionFormatService.getInstanceAndLog(401, `${defaultErrorMessage} UNAUTHORIZED`);

        const url = `${BACKEND_BASE_URL}/note/delete?id=${noteEntity.id}`;
        const response = await fetchAny(url, "delete", noteEntity);

        if (isResponseError(response)) {
            toast(defaultErrorMessage, DEFAULT_ERROR_MESSAGE, "error");
            return CustomExceptionFormatService.getInstance(response.status, response.message);
        }

        return response;
    }


    /**
     * Save any unsaved notes, update ```noteEntities``` and notify start page content.
     */
    async function handleLogin(): Promise<void> {

        const unsavedNoteEntities = getUnsavedNoteEntities();

        // case: no unsaved notes
        if (!unsavedNoteEntities.length) 
            setNoteEntities([...useQueryResult.data]);
            
        else {
            const jsonResponse = await fetchSaveAll(unsavedNoteEntities);
            if (isResponseError(jsonResponse))
                return;
            
            toast("Save all notes", "All new notes saved successfully", "success", 4000);
        }

        localStorage.removeItem(UNSAVD_NOTES_KEY);
        
        // this is to notify the component to map all notes again
        setGotNewData(!gotNewData);
    }


    /**
     * Use either note serach results or fetched data.
     * 
     * @returns slice of ```useQueryResult.data``` depending on the current ```page``` and {@link NUM_NOTES_PER_PAGE}
     */
    function getNoteEntitiesPage(): NoteEntity[] {

        let noteEntities = noteSearchResults;

        // case: no search query
        if (!noteEntities)
            noteEntities = useQueryResult.data;

        // case: no notes
        if (!noteEntities || !noteEntities.length)
            return [];

        let cleanPage = currentPage;
        
        if (isNumberFalsy(currentPage) || currentPage < 1) {
            logWarn("Invalid page. Using page 1 as fallback");
            cleanPage = 1;
        }

        const startIndex = (cleanPage - 1) * NUM_NOTES_PER_PAGE;
        const endIndex = startIndex + NUM_NOTES_PER_PAGE;

        // case: invalid start index, this will work anyway but should not happen
        if (startIndex < 0 || startIndex >= noteEntities.length)
            logWarn(`'startIndex' ${startIndex} out of bounds for 'noteEntities' ${noteEntities.length}`);

        return noteEntities.slice(startIndex, endIndex);
    }


    function getUnsavedNoteEntities(): NoteEntity[] {

        const unsavedNoteEntities = jsonParseDontThrow<NoteEntity[]>(localStorage.getItem(UNSAVD_NOTES_KEY));

        return unsavedNoteEntities || [];
    }


    /**
     * NOTE: oauth2 error redirects (resulting in a not-loggedIn state) will loose unsaved notes
     */
    function handleUnsavedNotesTransfer() {

        // transfer unsaved notes
        if (isLoggedIn) {
            if (noteEntities.length)
                localStorage.setItem(UNSAVD_NOTES_KEY, JSON.stringify(noteEntities));
    
            handleLogin();
        } 
    }

        
    return {
        noteEntities, setNoteEntities,
        noteSearchResults, setNoteSearchResults,
        useQueryResult,
        isFetchTakingLonger,
        gotNewData, setGotNewData,
        currentPage, setCurrentPage,

        fetchSave,
        fetchSaveAll,
        fetchDelete
    }
}

export const NOTE_QUERY_KEY = ["notes"];
export const UNSAVD_NOTES_KEY = "unsavedNotes";