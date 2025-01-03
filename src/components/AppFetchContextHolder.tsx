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
    
    const { 
        isLoggedIn, 
        useQueryResult: isLoggedInUseQueryResult
    } = useLoggedIn();

    const { 
        appUserEntity, 
        setAppUserEntity, 
        useQueryResult: appUserEntityUseQueryResult,
        fetchSave: fetchSaveAppUserEntity, 
        fetchLogin, 
    } = useAppUser(isLoggedIn);

    const { 
        noteEntities, 
        setNoteEntities,
        noteSearchResults, 
        setNoteSearchResults,
        useQueryResult: noteUseQueryResult ,
        isFetchTakingLonger: isFetchNoteEntitiesTakingLonger, 
        fetchSave: fetchSaveNoteEntity, 
        fetchSaveAll: fetchSaveAllNoteEntities,
        fetchDelete: fetchDeleteNoteEntity, 
        gotNewData: gotNewNoteEntities, 
        setGotNewData: setGotNewNoteEntities,
        currentPage: currentNotesPage, 
        setCurrentPage: setCurrentNotesPage
    } = useNotes(isLoggedIn, appUserEntity);

    const context = {
        appUserEntity, 
        setAppUserEntity, 
        appUserEntityUseQueryResult,
        fetchSaveAppUserEntity, 
        fetchLogin, 

        noteEntities, 
        setNoteEntities, 
        noteSearchResults,
        setNoteSearchResults,
        noteUseQueryResult,
        isFetchNoteEntitiesTakingLonger, 
        fetchSaveNoteEntity, 
        fetchSaveAllNoteEntities,
        fetchDeleteNoteEntity, 
        gotNewNoteEntities,
        setGotNewNoteEntities,
        currentNotesPage,
        setCurrentNotesPage,

        isLoggedIn, 
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
        setNoteEntities([]);
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

    noteEntities: [] as NoteEntity[],
    setNoteEntities: (noteEntities: NoteEntity[]) => {},
    noteSearchResults: undefined as NoteEntity[] | undefined, 
    setNoteSearchResults: (results: NoteEntity[] | undefined) => {},
    fetchSaveNoteEntity: async (noteEntity: NoteEntity) => {return {} as Promise<NoteEntity | CustomExceptionFormat>},
    fetchSaveAllNoteEntities: async (noteEntities: NoteEntity[]) => {return {} as Promise<NoteEntity[] | CustomExceptionFormat>},
    fetchDeleteNoteEntity: async (noteEntity: NoteEntity) => {return {} as Promise<Response | CustomExceptionFormat>},
    isFetchNoteEntitiesTakingLonger: false as boolean,
    noteUseQueryResult: {} as DefinedUseQueryResult<NoteEntity[]>,
    gotNewNoteEntities: false as boolean,
    setGotNewNoteEntities: (newNoteEntities: boolean) => {},
    currentNotesPage: 1 as number,
    setCurrentNotesPage: (page: number) => {},

    isLoggedIn: false,
    isLoggedInUseQueryResult: {} as DefinedUseQueryResult<boolean>,

    logout: async () => {}
})