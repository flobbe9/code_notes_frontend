import { useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NoteEntity } from './../abstract/entites/NoteEntity';
import { AppContext } from "../components/App";
import { BACKEND_BASE_URL } from "../helpers/constants";
import fetchJson, { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { CustomExceptionFormatService } from "../services/CustomExceptionFormatService";
import { AppUserEntity } from './../abstract/entites/AppUserEntity';
import { useIsFetchTakingLong } from "./useIsFetchTakingLong";
import { log } from "../helpers/utils";


export function useNotes(isLoggedIn: boolean, appUserEntity: AppUserEntity) {

    const [noteEntities, setNoteEntities] = useState<NoteEntity[]>([]);

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
        if (useQueryResult.data)
            setNoteEntities(useQueryResult.data);

    }, [useQueryResult.data]);


    useEffect(() => {
        if (isLoggedIn && appUserEntity)
            useQueryResult.refetch();

    }, [isLoggedIn, appUserEntity])


    async function fetchNotes(): Promise<NoteEntity[]> {

        if (!isLoggedIn || !appUserEntity)
            return [];

        const url = `${BACKEND_BASE_URL}/note/get-all-by-appUser`;

        const jsonResponse = await fetchJson(url);

        if (isResponseError(jsonResponse)) {
            if (jsonResponse.status !== 401)
                toast("Failed to load notes", "An unexpected error occurred. Please try refreshing the page.", "error");

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

        const url = `${BACKEND_BASE_URL}/note/save`;

        const jsonResponse = await fetchJson(url, "post", noteEntity);

        if (isResponseError(jsonResponse)) {
            if (jsonResponse.status !== 401)
                toast("Failed to save note", "An unexpected error has occurred. Please secure your unsaved contents and refresh the page.", "error");

            return CustomExceptionFormatService.getInstance(jsonResponse.status, jsonResponse.message);
        }

        return jsonResponse;
    }


    async function fetchDelete(noteEntity: NoteEntity): Promise<CustomExceptionFormat | Response> {

        const defaultErrorMessage = "Failed to delete note.";

        if (!noteEntity || !isLoggedIn)
            return CustomExceptionFormatService.getInstanceAndLog(500, `${defaultErrorMessage} 'noteEntity' cannot be falsy`);

        const url = `${BACKEND_BASE_URL}/note/delete?id=${noteEntity.id}`;

        const response = await fetchAny(url, "delete", noteEntity);

        if (isResponseError(response)) {
            if (response.status !== 401)
                toast(defaultErrorMessage, "An unexpected error occurred. Please try refreshing the page.", "error");

            return CustomExceptionFormatService.getInstance(response.status, response.message);
        }

        return response;
    }


    return {
        noteEntities,
        setNoteEntities,
        useQueryResult,
        isFetchTakingLonger,

        fetchSave,
        fetchDelete
    }
}

export const NOTE_QUERY_KEY = ["notes"];