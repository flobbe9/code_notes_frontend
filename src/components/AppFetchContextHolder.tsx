import { DefinedUseQueryResult } from "@tanstack/react-query";
import React, { createContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { AppUserService } from "../abstract/services/AppUserService";
import { LOGOUT_URL } from "../helpers/constants";
import fetchJson from "../helpers/fetchUtils";
import { clearUserCache } from "../helpers/utils";
import { useAppUser } from "../hooks/useAppUser";
import { useLoggedIn } from "../hooks/useLoggedIn";
import { useNotes } from "../hooks/useNotes";


/**
 * Contains fetched states that are used globally but at the same time need the ```AppContext```. 
 * 
 * Does not use any props but the  ```children```.
 * 
 * @parent ```<App>```
 * @since 0.0.1
 */
export default function AppFetchContextHolder({ children }) {

    const location = useLocation();

    const isLoggedInUseQueryResult = useLoggedIn();

    const { 
        appUserEntity, 
        setAppUserEntity, 
        useQueryResult: appUserEntityUseQueryResult,
        fetchSave: fetchSaveAppUserEntity, 
        fetchLogin, 
    } = useAppUser(isLoggedInUseQueryResult.data);

    const { 
        editedNoteEntities, 
        setEditedNoteEntities,
        noteSearchResults, 
        setNoteSearchResults,
        notesUseQueryResult,
        notesTotalUseQueryResult,
        isFetchTakingLonger: isFetchNoteEntitiesTakingLonger, 
        fetchSave: fetchSaveNoteEntity, 
        fetchSaveAll: fetchSaveAllNoteEntities,
        fetchDelete: fetchDeleteNoteEntity, 
        currentPage: currentNotesPage, 
        setCurrentPage: setCurrentNotesPage
    } = useNotes(isLoggedInUseQueryResult, appUserEntity);

    const context = {
        appUserEntity, 
        setAppUserEntity, 
        appUserEntityUseQueryResult,
        fetchSaveAppUserEntity, 
        fetchLogin, 

        editedNoteEntities, 
        setEditedNoteEntities, 
        noteSearchResults,
        setNoteSearchResults,
        notesUseQueryResult,
        notesTotalUseQueryResult,
        isFetchNoteEntitiesTakingLonger, 
        fetchSaveNoteEntity, 
        fetchSaveAllNoteEntities,
        fetchDeleteNoteEntity, 
        currentNotesPage,
        setCurrentNotesPage,

        isLoggedIn: isLoggedInUseQueryResult.data, 
        isLoggedInUseQueryResult,

        logout
    }
    

    // revalidate session
    useEffect(() => {
        isLoggedInUseQueryResult.refetch();

    }, [location]);
    

    useEffect(() => {
        if (!isLoggedInUseQueryResult.data && isLoggedInUseQueryResult.isFetched)
            handleSessionInvalid();

    }, [isLoggedInUseQueryResult.data, isLoggedInUseQueryResult.isFetched]);

    
    /**
     * Clear user related use query cache and user related global states.
     */
    function handleSessionInvalid() {

        clearUserCache();
        setAppUserEntity(AppUserService.getDefaultInstance());
        // TODO:
            // add a condition under which this should not be cleared
                // if loggedout
                    // only if note id is null, dont display saved user data
                // only if was "save your unsaved changes, and logout" error
                    // move edited notes to cache on refresh
                    // render edited notes from cache on load and login if present, then clear
        setEditedNoteEntities([]); 
    }


    /**
     * Reset global states, clear use query cache and fetch logout.
     */
    async function logout(): Promise<void> {

        await fetchJson(LOGOUT_URL, "post");

        isLoggedInUseQueryResult.refetch();
    }


    return (
        <AppFetchContext.Provider value={context}>
            {children}
        </AppFetchContext.Provider>
    )
}


export const AppFetchContext = createContext({
    appUserEntity: AppUserService.getDefaultInstance() as AppUserEntity,
    setAppUserEntity: (appUserEntity: AppUserEntity) => {},
    appUserEntityUseQueryResult: {} as DefinedUseQueryResult<AppUserEntity>,
    fetchSaveAppUserEntity: async (appUserToSave?: AppUserEntity, decrypt = true) => {return {} as Promise<AppUserEntity | CustomExceptionFormat> },
    fetchLogin: async (email: string, password: string) => {return {} as Promise<CustomExceptionFormat | Response>},

    editedNoteEntities: [] as NoteEntity[],
    setEditedNoteEntities: (editedNoteEntities: NoteEntity[]) => {},
    noteSearchResults: undefined as NoteEntity[] | undefined, 
    setNoteSearchResults: (results: NoteEntity[] | undefined) => {},
    fetchSaveNoteEntity: async (noteEntity: NoteEntity) => {return {} as Promise<NoteEntity | CustomExceptionFormat>},
    fetchSaveAllNoteEntities: async (editedNoteEntities: NoteEntity[]) => {return {} as Promise<NoteEntity[] | CustomExceptionFormat>},
    fetchDeleteNoteEntity: async (noteEntity: NoteEntity) => {return {} as Promise<Response | CustomExceptionFormat>},
    isFetchNoteEntitiesTakingLonger: false as boolean,
    notesUseQueryResult: {} as DefinedUseQueryResult<NoteEntity[]>,
    notesTotalUseQueryResult: {} as DefinedUseQueryResult<number>,
    /** 1-based */
    currentNotesPage: 1 as number,
    setCurrentNotesPage: (page: number) => {},

    isLoggedIn: false,
    isLoggedInUseQueryResult: {} as DefinedUseQueryResult<boolean>,

    logout: async () => {}
})