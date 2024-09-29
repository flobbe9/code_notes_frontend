import React, { createContext } from "react";
import { useLoggedIn } from "../hooks/useLoggedIn";
import { useNotes } from "../hooks/useNote";
import { useAppUser } from "../hooks/useAppUser";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { AppUserService } from "../services/AppUserService";
import { RefetchOptions, QueryObserverResult } from "@tanstack/react-query";


/**
 * Contains fetched states that are used globally but at the same time need the ```AppContext```. 
 * 
 * Does not use any props but the  ```children```.
 * 
 * @parent ```<App>```
 * @since 0.0.1
 */
export default function AppFetchContextHolder({ children }) {
    
    const { isLoggedIn, setIsLoggedIn, isLoggedInFetched } = useLoggedIn();
    const { appUserEntity, setAppUserEntity, isAppUserEntityFetched, fetchSaveAppUserEntity, fetchLogin, refetchAppUserEntity } = useAppUser(isLoggedIn);
    const { noteEntities, setNoteEntities, isNoteEntitiesFetched, fetchSaveNoteEntity, fetchDeleteNoteEntity, isFetchNoteEntitiesTakingLonger } = useNotes(isLoggedIn, appUserEntity);

    const context = {
        appUserEntity, setAppUserEntity, isAppUserEntityFetched, fetchSaveAppUserEntity, fetchLogin, refetchAppUserEntity,

        noteEntities, setNoteEntities, isNoteEntitiesFetched, fetchSaveNoteEntity, fetchDeleteNoteEntity, isFetchNoteEntitiesTakingLonger,

        isLoggedIn, setIsLoggedIn, isLoggedInFetched,
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
    isAppUserEntityFetched: false,
    fetchSaveAppUserEntity: async (appUserToSave?: AppUserEntity, decrypt = true) => {return {} as Promise<AppUserEntity | CustomExceptionFormat> },
    fetchLogin: async (email: string, password: string) => {return {} as Promise<CustomExceptionFormat | Response>},
    refetchAppUserEntity: async (options?: RefetchOptions) => {return {} as  Promise<QueryObserverResult<AppUserEntity, Error>>},

    noteEntities: [] as NoteEntity[],
    setNoteEntities: (noteEntities: NoteEntity[]) => {},
    isNoteEntitiesFetched: false as boolean,
    fetchSaveNoteEntity: async (noteEntity: NoteEntity) => {return {} as Promise<NoteEntity | CustomExceptionFormat>},
    fetchDeleteNoteEntity: async (noteEntity: NoteEntity) => {return {} as Promise<Response | CustomExceptionFormat>},
    isFetchNoteEntitiesTakingLonger: false as boolean,

    isLoggedIn: false,
    setIsLoggedIn: (isLoggedIn: boolean) => {},
    isLoggedInFetched: false,
})