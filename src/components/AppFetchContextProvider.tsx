import { DefinedUseQueryResult } from "@tanstack/react-query";
import { createContext, useEffect } from "react";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import { SearchNoteResultDto } from "../abstract/SearchNoteResultDto";
import { AppUserService } from "../abstract/services/AppUserService";
import { LOGOUT_URL } from "../helpers/constants";
import fetchJson from "../helpers/fetchUtils";
import { clearUserCache } from "../helpers/projectUtils";
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
export default function AppFetchContextProvider({ children }) {

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
        getSearchPhrase, setSearchPhrase,
        getSearchTags, setSearchTags,
        notesUseQueryResult,
        isFetchTakingLonger: isFetchNoteEntitiesTakingLonger, 
        fetchSave: fetchSaveNoteEntity, 
        fetchSaveAll: fetchSaveAllNoteEntities,
        fetchDelete: fetchDeleteNoteEntity, 
        getCurrentPage: getCurrentNotesPage,
        setCurrentPage: setCurrentNotesPage,
        totalPages: totalNotePages
    } = useNotes(isLoggedInUseQueryResult, appUserEntity);

    const context = {
        appUserEntity, 
        setAppUserEntity, 
        appUserEntityUseQueryResult,
        fetchSaveAppUserEntity, 
        fetchLogin, 

        editedNoteEntities, 
        setEditedNoteEntities, 
        getNoteSearchPhrase: getSearchPhrase, 
        setNoteSearchPhrase: setSearchPhrase,
        getNoteSearchTags: getSearchTags, 
        setNoteSearchTags: setSearchTags,
        notesUseQueryResult,
        isFetchNoteEntitiesTakingLonger, 
        fetchSaveNoteEntity, 
        fetchSaveAllNoteEntities,
        fetchDeleteNoteEntity, 
        getCurrentNotesPage,
        setCurrentNotesPage,
        totalNotePages,

        isLoggedIn: isLoggedInUseQueryResult.data, 
        isLoggedInUseQueryResult,

        logout
    }

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
    setAppUserEntity: (_appUserEntity: AppUserEntity) => {},
    appUserEntityUseQueryResult: {} as DefinedUseQueryResult<AppUserEntity>,
    fetchSaveAppUserEntity: async (_appUserToSave?: AppUserEntity, _decrypt = true) => {return {} as Promise<AppUserEntity | CustomExceptionFormat> },
    fetchLogin: async (_email: string, _password: string) => {return {} as Promise<CustomExceptionFormat | Response>},

    editedNoteEntities: [] as NoteEntity[],
    setEditedNoteEntities: (_editedNoteEntities: NoteEntity[]) => {},
    getNoteSearchPhrase: () => "" as string,
    setNoteSearchPhrase: (_phrase: string) => {},
    getNoteSearchTags: () => new Set<string>(),
    setNoteSearchTags: (_tags: Set<string>) => {},
    fetchSaveNoteEntity: async (_noteEntity: NoteEntity) => {return {} as Promise<NoteEntity | CustomExceptionFormat>},
    fetchSaveAllNoteEntities: async (_editedNoteEntities: NoteEntity[]) => {return {} as Promise<NoteEntity[] | CustomExceptionFormat>},
    fetchDeleteNoteEntity: async (_noteEntity: NoteEntity) => {return {} as Promise<Response | CustomExceptionFormat>},
    isFetchNoteEntitiesTakingLonger: false as boolean,
    notesUseQueryResult: {} as DefinedUseQueryResult<SearchNoteResultDto>,
    /** 1-based */
    getCurrentNotesPage: () => 1 as number,
    setCurrentNotesPage: (_page: number) => {},
    totalNotePages: 0 as number,

    isLoggedIn: false,
    isLoggedInUseQueryResult: {} as DefinedUseQueryResult<boolean>,

    logout: async () => {}
})
