import { AppFetchContext } from "@/context/AppFetchContext";
import { useEffect } from "react";
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
