import { DefinedUseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppUserEntity } from '../abstract/entites/AppUserEntity';
import { NoteEntity } from '../abstract/entites/NoteEntity';
import { CustomExceptionFormatService } from "../abstract/services/CustomExceptionFormatService";
import { NoteEntityService } from "../abstract/services/NoteEntityService";
import { AppContext } from "../components/App";
import { BACKEND_BASE_URL, DEFAULT_ERROR_MESSAGE, NUM_NOTES_PER_PAGE, START_PAGE_PATH } from "../helpers/constants";
import fetchJson, { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { jsonParseDontThrow, logWarn, stringToNumber } from "../helpers/utils";
import { useIsFetchTakingLong } from "./useIsFetchTakingLong";


export function useNotes(isLoggedInUseQueryResult: DefinedUseQueryResult, appUserEntity: AppUserEntity) {

    /** List of noteEntities that have been edited since they were last saved. Order should not matter */
    const [editedNoteEntities, setEditedNoteEntities] = useState<NoteEntity[]>([]);
    /** 1-based */
    const [currentPage, setCurrentPage] = useState(1);
    /** Global search results. Should be set to ```undefined``` if there's no search query */
    const [noteSearchResults, setNoteSearchResults] = useState<NoteEntity[] | undefined>(undefined);

    const { toast } = useContext(AppContext);

    const queryClient = useQueryClient();

    const notesUseQueryResult = useQuery<NoteEntity[]>({
        queryKey: NOTES_QUERY_KEY,
        queryFn: fetchNotes,
        initialData: queryClient.getQueryData(NOTES_QUERY_KEY) || []
    });

    const notesTotalUseQueryResult = useQuery<number>({
        queryKey: NOTES_TOTAL_QUERY_KEY,
        queryFn: fetchNotesTotal,
        initialData: queryClient.getQueryData(NOTES_TOTAL_QUERY_KEY) || 0
    });


    /** The time (in milliseconds) the note entities' fetch process may take before considering the process "taking longer" */
    const noteEntitiesFetchDelay = 500;
    const isFetchTakingLonger = useIsFetchTakingLong(notesUseQueryResult.isFetched, noteEntitiesFetchDelay, !notesUseQueryResult.isFetched);


    useEffect(() => {
        notesUseQueryResult.refetch();
        
    }, [currentPage]);

    
    useEffect(() => {
        notesTotalUseQueryResult.refetch();

    }, [notesUseQueryResult.data, noteSearchResults]);


    useEffect(() => {
        handleLogin();

    }, [isLoggedInUseQueryResult.data, isLoggedInUseQueryResult.isFetched]);


    /**
     * Only fetch if is ```START_PAGE_PATH```.
     * 
     * ```pageNumber``` param is 0-based and cannot be negative. ```pageSize``` param needs to be greater equal 1
     * 
     * @returns fetched editedNoteEntities or empty array
     */
    async function fetchNotes(): Promise<NoteEntity[]> {

        if (!isLoggedInUseQueryResult.data || !appUserEntity || window.location.pathname !== START_PAGE_PATH)
            return [];

        // -1 because currentPage is 1-based but pageNumber param is 0-based, 
        const url = `${BACKEND_BASE_URL}/note/get-by-app_user-pageable?pageNumber=${currentPage - 1}&pageSize=${NUM_NOTES_PER_PAGE}`;

        const jsonResponse = await fetchJson(url);
        if (isResponseError(jsonResponse)) {
            toast("Failed to load notes", DEFAULT_ERROR_MESSAGE, "error");
            return [];
        }

        return jsonResponse;
    }


    /**
     * @returns total num of notes for the current app user
     */
    async function fetchNotesTotal(): Promise<number> {

        if (!isLoggedInUseQueryResult.data || !appUserEntity)
            return 0;

        const url = `${BACKEND_BASE_URL}/note/count-by-app_user`;

        const response = await fetchAny(url);

        if (isResponseError(response)) {
            toast("Failed to load notes count", DEFAULT_ERROR_MESSAGE, "error");
            return 0;
        }

        return stringToNumber(await response.text());
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

        if (!isLoggedInUseQueryResult.data)
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
     * Save given ```editedNoteEntities``` or return error obj. Will toast on fetch error.
     * 
     * @param editedNoteEntities to save
     * @returns the saved note entity or an error obj
     */
    async function fetchSaveAll(editedNoteEntities: NoteEntity[]): Promise<NoteEntity[] | CustomExceptionFormat> {

        if (!editedNoteEntities)
            return CustomExceptionFormatService.getInstanceAndLog(500, "Failed to save note entities. 'noteEntity' cannot be falsy");

        if (!new NoteEntityService().areValidIncludeReferences(toast, ...editedNoteEntities))
            return CustomExceptionFormatService.getInstanceAndLog(400, "Failed to save note entity. BAD_REQUEST");

        const url = `${BACKEND_BASE_URL}/note/save-all`;
        const jsonResponse = await fetchJson(url, "post", editedNoteEntities);

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
        
        if (!isLoggedInUseQueryResult.data)
            return CustomExceptionFormatService.getInstanceAndLog(401, `${defaultErrorMessage} UNAUTHORIZED`);

        const url = `${BACKEND_BASE_URL}/note/delete?id=${noteEntity.id}`;
        const response = await fetchAny(url, "delete", noteEntity);

        if (isResponseError(response)) {
            toast(defaultErrorMessage, DEFAULT_ERROR_MESSAGE, "error");
            return CustomExceptionFormatService.getInstance(response.status, response.message);
        }

        return response;
    }


    function getEditedNoteEntitiesFromCache(): NoteEntity[] {

        const unsavedNoteEntities = jsonParseDontThrow<NoteEntity[]>(localStorage.getItem(EDITED_NOTES_KEY));

        return unsavedNoteEntities || [];
    }


    function clearEditedNoteEntitiesFromCache(): void {

        localStorage.removeItem(EDITED_NOTES_KEY);
    }


    /**
     * Fetch saves edited notes (wont refetch). Use notes either from state or cache, will work for both normal and oauth2 login. 
     * 
     * NOTE: fetch error during oauth2 login or oauth2 save all will loose edited notes
     */
    async function saveEditedNoteEntities(): Promise<void> {

        if (!isLoggedInUseQueryResult.data)
            return;

        const actualEditedNoteEntities = editedNoteEntities.length ? editedNoteEntities : getEditedNoteEntitiesFromCache();

        if (!actualEditedNoteEntities.length) 
            return;

        const jsonResponse = await fetchSaveAll(actualEditedNoteEntities);
        if (isResponseError(jsonResponse)) 
            logWarn("Failed to transfer unsaved notes", 8000);

        else
            toast("Saved all notes", "All new notes saved successfully", "success", 4000);
        
        setEditedNoteEntities([]);
        clearEditedNoteEntitiesFromCache();
    }


    /**
     * Save edited notes and (either way) refetch notes
     */
    async function handleLogin(): Promise<void> {

        await saveEditedNoteEntities();

        await notesUseQueryResult.refetch();
    }

        
    return {
        notesUseQueryResult,
        isFetchTakingLonger,
        editedNoteEntities, setEditedNoteEntities,

        noteSearchResults, setNoteSearchResults,
        notesTotalUseQueryResult,
        currentPage, setCurrentPage,

        fetchSave,
        fetchSaveAll,
        fetchDelete
    }
}


export const NOTES_QUERY_KEY = ["notes"];
export const NOTES_TOTAL_QUERY_KEY = ["noteTotal"];
export const EDITED_NOTES_KEY = "unsavedNotes";