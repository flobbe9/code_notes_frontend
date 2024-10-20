import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { AppContext } from "../components/App";
import { BACKEND_BASE_URL } from "../helpers/constants";
import fetchJson, { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { AppUserService } from "../services/AppUserService";
import { isBlank, logError } from "../helpers/utils";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { CustomExceptionFormatService } from "../services/CustomExceptionFormatService";


/**
 * Fetch current app user on render (only if ```isLoggedIn```) and cache.
 * 
 * @since 0.0.1
 */
export function useAppUser(isLoggedIn: boolean) {
    
    const initAppUserEntity = AppUserService.getDefaultInstance();
    const [appUserEntity, setAppUserEntity] = useState<AppUserEntity>(initAppUserEntity);
    const { toast } = useContext(AppContext);

    const queryClient = useQueryClient();


    const { data, isFetched, refetch } = useQuery<AppUserEntity>({
        queryKey: APP_USER_QUERY_KEY,
        queryFn: fetchCurrentAppUser,
        initialData: queryClient.getQueryData(APP_USER_QUERY_KEY) || initAppUserEntity
    });


    useEffect(() => {
        if (data)
            setAppUserEntity(data);

    }, [data]);


    useEffect(() => {
        if (isLoggedIn)
            refetch();
        
    }, [isLoggedIn])


    async function fetchCurrentAppUser(): Promise<AppUserEntity> {

        if (!isLoggedIn)
            return initAppUserEntity;

        const url = `${BACKEND_BASE_URL}/app-user/getCurrent`;

        const jsonResponse = await fetchJson(url, "post");

        // case: fetch error
        if (isResponseError(jsonResponse)) {
            // TODO: handle 401 differently here?
                toast("Unexpected Error", "The page could not be loaded completely. Please refresh the page.", "error");
            return initAppUserEntity;
        }

        return AppUserService.encryptSensitiveFields(jsonResponse);
    }
    

    /**
     * Save given ```appUserToSave``` if has no id or update if has an existing one.
     * 
     * Expecting all fields to present.
     * 
     * @param appUserToSave to save or update. Wont be altered
     * @param decrypt indicates whether to decrypt sensitive fields of given ```appUserToSave``` (see {@link decryptSensitiveFields})
     */
    async function fetchSave(appUserToSave = appUserEntity, decrypt = true): Promise<AppUserEntity | CustomExceptionFormat> {

        // case: falsy arg
        if (!appUserToSave) {
            logError("Failed to save app user. 'appUserToSave' cannot be falsy");
            return CustomExceptionFormatService.getInstance(500, "Failed to save app user. 'appUserToSave' cannot be falsy");
        }

        let appUserToSaveCopy = appUserToSave;

        // case: given app user is encrypted
        if (decrypt)
            appUserToSaveCopy = AppUserService.decryptSensitiveFields(appUserToSave);

        const url = `${BACKEND_BASE_URL}/app-user/save`;
        return await fetchJson(url, "post", appUserToSaveCopy);
    }


    /**
     * Fetch login request which will create a session in the browser.
     * 
     * @param email of the app user
     * @param password of the app user
     * @returns the response which is either a ```Response``` object with a csrf token or an error object
     */
    async function fetchLogin(email: string, password: string): Promise<Response | CustomExceptionFormat> {

        if (isBlank(email) || isBlank(password))
            return CustomExceptionFormatService.getInstance(400, "Failed to fetch login. 'email' or 'password' are blank");

        const url = `${BACKEND_BASE_URL}/login?username=${email}&password=${password}`;

        return await fetchAny(url, "post");
    }
    

    /**
     * Make logout request to backend. Cannot fail
     */
    async function fetchLogout(): Promise<void> {

        const url = `${BACKEND_BASE_URL}/logout`;

        await fetchAny(url);
    }

    
    return {
        appUserEntity,
        setAppUserEntity,
        isAppUserEntityFetched: isFetched,
        refetchAppUserEntity: refetch,

        fetchSaveAppUserEntity: fetchSave,
        fetchLogin,
        fetchLogout
    }
}

export const APP_USER_QUERY_KEY = ["appUser"];