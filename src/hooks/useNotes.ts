import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppUserEntity } from '../abstract/entites/AppUserEntity';
import { NoteEntity } from '../abstract/entites/NoteEntity';
import { CustomExceptionFormatService } from "../abstract/services/CustomExceptionFormatService";
import { NoteEntityService } from "../abstract/services/NoteEntityService";
import { AppContext } from "../components/App";
import { BACKEND_BASE_URL, DEFAULT_ERROR_MESSAGE } from "../helpers/constants";
import fetchJson, { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { useIsFetchTakingLong } from "./useIsFetchTakingLong";


export function useNotes(isLoggedIn: boolean, appUserEntity: AppUserEntity) {

    const [noteEntities, setNoteEntities] = useState<NoteEntity[]>([]);
    /** Notes created prior to login, these will be set right after logging in and then added to the ```noteEntities``` */
    const [unsavedNotes, setUnsavedNotes] = useState<NoteEntity[]>([]);
    /** Is a toggle state, meaning that the boolean does not reflect the states meaning. Is toggled everytime useQueryResult.data updates */
    const [gotNewData, setGotNewData] = useState(false);

    const { toast } = useContext(AppContext);

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
        if (useQueryResult.data && !unsavedNotes.length) {
            setNoteEntities(useQueryResult.data);
            // this is to notify the component to map all notes again
            setGotNewData(!gotNewData);
        }

    }, [useQueryResult.data]);


    useEffect(() => {
        if (isLoggedIn && appUserEntity)
            useQueryResult.refetch();

    }, [isLoggedIn, appUserEntity])


    useEffect(() => {
        if (isLoggedIn && noteEntities.length) {
            setUnsavedNotes([...noteEntities]);
            handleLogin();
        }
            
    }, [isLoggedIn])


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

        // case: no unsaved notes
        if (!noteEntities.length) {
            setNoteEntities([...useQueryResult.data]);
            
        } else {
            const jsonResponse = await fetchSaveAll(noteEntities);
            if (isResponseError(jsonResponse))
                return;
            
            setNoteEntities([...jsonResponse, ...useQueryResult.data]);
            setUnsavedNotes([]);
            
            toast("Save all notes", "All new notes saved successfully", "success", 4000);
        }

        // this is to notify the component to map all notes again
        setGotNewData(!gotNewData);
    }

    
    return {
        noteEntities,
        setNoteEntities,
        useQueryResult,
        isFetchTakingLonger,
        gotNewData, setGotNewData,

        fetchSave,
        fetchSaveAll,
        fetchDelete
    }
}

export const NOTE_QUERY_KEY = ["notes"];
