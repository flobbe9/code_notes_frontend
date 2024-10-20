import { DefinedUseQueryResult } from "@tanstack/react-query";
import React, { createContext, ReactNode } from "react";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { useAppUser } from "../hooks/useAppUser";
import { useLoggedIn } from "../hooks/useLoggedIn";
import { useNotes } from "../hooks/useNote";
import { AppUserService } from "../services/AppUserService";
import { log } from "../helpers/utils";


/**
 * Contains fetched states that are used globally but at the same time need the ```AppContext```. 
 * 
 * Does not use any props but the  ```children```.
 * 
 * @parent ```<App>```
 * @since 0.0.1
 */
export default function AppFetchContextHolder({ children }) {
    
    const { 
        isLoggedIn, 
        setIsLoggedIn, 
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
        useQueryResult: noteUseQueryResult ,
        isFetchTakingLonger: isFetchNoteEntitiesTakingLonger, 
        fetchSave: fetchSaveNoteEntity, 
        fetchDelete: fetchDeleteNoteEntity, 
    } = useNotes(isLoggedIn, appUserEntity);

    const context = {
        appUserEntity, 
        setAppUserEntity, 
        appUserEntityUseQueryResult,
        fetchSaveAppUserEntity, 
        fetchLogin, 

        noteEntities, 
        setNoteEntities, 
        noteUseQueryResult,
        isFetchNoteEntitiesTakingLonger, 
        fetchSaveNoteEntity, 
        fetchDeleteNoteEntity, 

        isLoggedIn, 
        setIsLoggedIn, 
        isLoggedInUseQueryResult,
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
    appUserEntityUseQueryResult: {} as DefinedUseQueryResult,
    fetchSaveAppUserEntity: async (appUserToSave?: AppUserEntity, decrypt = true) => {return {} as Promise<AppUserEntity | CustomExceptionFormat> },
    fetchLogin: async (email: string, password: string) => {return {} as Promise<CustomExceptionFormat | Response>},

    noteEntities: [] as NoteEntity[],
    setNoteEntities: (noteEntities: NoteEntity[]) => {},
    fetchSaveNoteEntity: async (noteEntity: NoteEntity) => {return {} as Promise<NoteEntity | CustomExceptionFormat>},
    fetchDeleteNoteEntity: async (noteEntity: NoteEntity) => {return {} as Promise<Response | CustomExceptionFormat>},
    isFetchNoteEntitiesTakingLonger: false as boolean,
    noteUseQueryResult: {} as DefinedUseQueryResult,

    isLoggedIn: false,
    setIsLoggedIn: (isLoggedIn: boolean) => {},
    isLoggedInUseQueryResult: {} as DefinedUseQueryResult,
})