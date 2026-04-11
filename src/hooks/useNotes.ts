import { DefinedUseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppUserEntity } from '../abstract/entites/AppUserEntity';
import { NoteEntity } from '../abstract/entites/NoteEntity';
import { createSearchNoteResultDtoInstance, SearchNoteResultDto } from "../abstract/SearchNoteResultDto";
import { CustomExceptionFormatService } from "../abstract/services/CustomExceptionFormatService";
import { NoteEntityService } from "../abstract/services/NoteEntityService";
import { AppContext } from "@/context/AppContext";
import { BACKEND_BASE_URL, DEFAULT_ERROR_MESSAGE, NOTE_PAGE_URL_QUERY_PARAM, NOTE_SEARCH_PHRASE_URL_QUERY_PARAM, NOTE_SEARCH_TAGS_URL_QUERY_PARAM, NOTE_SEARCH_TAGS_URL_QUERY_PARAM_SEPARATOR, NUM_NOTES_PER_PAGE, START_PAGE_PATH } from "../helpers/constants";
import fetchJson, { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { logWarn } from "../helpers/logUtils";
import { getUrlQueryParam, isBlank, isNumberFalsy, isStringFalsy, jsonParseDontThrow, setUrlQueryParam, stringToNumber } from "../helpers/utils";
import { useIsFetchTakingLong } from "./useIsFetchTakingLong";


/**
 * @since 0.0.1
 */
export function useNotes(isLoggedInUseQueryResult: DefinedUseQueryResult, appUserEntity: AppUserEntity) {

    /** List of noteEntities that have been edited since they were last saved. Order should not matter */
    const [editedNoteEntities, setEditedNoteEntities] = useState<NoteEntity[]>([]);
    /** Num pages of not search results. */
    const [totalPages, setTotalPages] = useState(0);

    const { toast } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    const queryClient = useQueryClient();

    const notesUseQueryResult = useQuery<SearchNoteResultDto>({
        queryKey: NOTES_QUERY_KEY,
        queryFn: fetchNotes,
        initialData: queryClient.getQueryData(NOTES_QUERY_KEY) ?? createSearchNoteResultDtoInstance()
    });


    /** The time (in milliseconds) the note entities' fetch process may take before considering the process "taking longer" */
    const noteEntitiesFetchDelay = 500;
    const isFetchTakingLonger = useIsFetchTakingLong(notesUseQueryResult.isFetched, noteEntitiesFetchDelay, !notesUseQueryResult.isFetched);

    useEffect(() => {
        handleLogin();
    }, [isLoggedInUseQueryResult.data, isLoggedInUseQueryResult.isFetched]);

    useEffect(() => {
        notesUseQueryResult.refetch();
    }, [location]);

    useEffect(() => {
        setTotalPages(getTotalPages());
    }, [notesUseQueryResult.data])

    /**
     * Only fetch if is ```START_PAGE_PATH```.
     * 
     * ```pageNumber``` param is 0-based and cannot be negative. ```pageSize``` param needs to be greater equal 1
     * 
     * @returns fetched editedNoteEntities or an instance with an empty array and 0 as total results value, never `null`
     */
    async function fetchNotes(): Promise<SearchNoteResultDto> {
        if (!isLoggedInUseQueryResult.data || !appUserEntity || window.location.pathname !== START_PAGE_PATH)
            return createSearchNoteResultDtoInstance();

        const url = `${BACKEND_BASE_URL}/note/get-by-app_user-pageable?pageNumber=${getCurrentPage() - 1
            }&pageSize=${NUM_NOTES_PER_PAGE
            }&${NOTE_SEARCH_PHRASE_URL_QUERY_PARAM}=${getSearchPhrase()
            }&${NOTE_SEARCH_TAGS_URL_QUERY_PARAM}=${concatTagNames(getSearchTags())}`;

        const jsonResponse = await fetchJson(url);
        if (isResponseError(jsonResponse)) {
            toast("Failed to load notes", DEFAULT_ERROR_MESSAGE, "error");
            return createSearchNoteResultDtoInstance();
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

    /**
     * Will update the {@link NOTE_PAGE_QUERY_PARAM} url query param (even if not present yet) regardless of 
     * the current path.
     * 
     * Do nothing if ```pageNum``` is invalid.
     * 
     * @param pageNum 1-based, the page number for note results
     */
    function setCurrentPage(pageNum: number): void {
        if (isNumberFalsy(pageNum))
            return;

        setUrlQueryParam(NOTE_PAGE_URL_QUERY_PARAM, pageNum.toString(), navigate);
    }

    /**
     * Retrieves the {@link NOTE_PAGE_URL_QUERY_PARAM} from the current url. 
     * 
     * @returns the current page of note results (1-based) or 1 if param is invalid
     */
    function getCurrentPage(): number {
        const queryParamValue = getUrlQueryParam(NOTE_PAGE_URL_QUERY_PARAM);
        if (isBlank(queryParamValue))
            return 1;

        const pageNum = stringToNumber(queryParamValue);
        if (isNumberFalsy(pageNum))
            return 1;

        return pageNum;
    }
    
    function getTotalPages(): number {
        return Math.ceil(notesUseQueryResult.data.totalResults / NUM_NOTES_PER_PAGE);
    }

    function getSearchPhrase() {
        const queryParamValue = getUrlQueryParam(NOTE_SEARCH_PHRASE_URL_QUERY_PARAM);
        if (isBlank(queryParamValue))
            return "";

        return queryParamValue!;
    }

    /**
     * Updates the url query param {@link NOTE_SEARCH_PHRASE_URL_QUERY_PARAM} but only if given ```searchPhrase``` is
     * a valid string.
     * 
     * @param searchPhrase input from note searchbar 
     */
    function setSearchPhrase(searchPhrase: string): void {
        if (isStringFalsy(searchPhrase))
            return;

        if (isBlank(searchPhrase)) 
            setUrlQueryParam(NOTE_SEARCH_PHRASE_URL_QUERY_PARAM, "", navigate);

        else 
            setUrlQueryParam(NOTE_SEARCH_PHRASE_URL_QUERY_PARAM, searchPhrase, navigate);
    }

    function getSearchTags(): Set<string> {
        const queryParamValue = getUrlQueryParam(NOTE_SEARCH_TAGS_URL_QUERY_PARAM);
        if (isBlank(queryParamValue))
            return new Set();

        return new Set(queryParamValue!.split(NOTE_SEARCH_TAGS_URL_QUERY_PARAM_SEPARATOR));
    }

    function concatTagNames(searchTags: Set<string> | string[]): string {
        const searchTagsArray = [...searchTags || []];

        if (!searchTagsArray.length)
            return "";

        return [...searchTags]
            .reduce((prev, curr) => `${prev}${NOTE_SEARCH_TAGS_URL_QUERY_PARAM_SEPARATOR}${curr}`);
    }

    /**
     * Updates the url query param {@link NOTE_SEARCH_TAGS_URL_QUERY_PARAM} but only if given ```tagNames``` is
     * a valid array.
     * 
     * @param tagNames input from note searchbar 
     */
    function setSearchTags(tagNames: Set<string>): void {
        if (!tagNames)
            return;

        // case: no tags selected
        if (!tagNames.size)
            setUrlQueryParam(NOTE_SEARCH_TAGS_URL_QUERY_PARAM, "", navigate);

        else {
            const searchTagsString = concatTagNames(tagNames);
            setUrlQueryParam(NOTE_SEARCH_TAGS_URL_QUERY_PARAM, searchTagsString, navigate);
        }
    }
        
    return {
        notesUseQueryResult,
        isFetchTakingLonger,
        editedNoteEntities, setEditedNoteEntities,
        getSearchPhrase, setSearchPhrase,
        getSearchTags, setSearchTags,

        getCurrentPage, setCurrentPage, totalPages,

        fetchSave,
        fetchSaveAll,
        fetchDelete
    }
}


export const NOTES_QUERY_KEY = ["notes"];
export const NOTES_TOTAL_QUERY_KEY = ["noteTotal"];
export const EDITED_NOTES_KEY = "unsavedNotes";
