import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { AppUserService } from "../abstract/services/AppUserService";
import { CustomExceptionFormatService } from "../abstract/services/CustomExceptionFormatService";
import { AppContext } from "@/context/AppContext";
import { BACKEND_BASE_URL } from "../helpers/constants";
import fetchJson, { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { isBlank } from "../helpers/utils";
import { logError } from "../helpers/logUtils";


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

    const useQueryResult = useQuery<AppUserEntity>({
        queryKey: APP_USER_QUERY_KEY,
        queryFn: fetchCurrentAppUser,
        initialData: queryClient.getQueryData(APP_USER_QUERY_KEY) || initAppUserEntity
    });


    useEffect(() => {
        if (useQueryResult.data) {
            useQueryResult.data.tags = [...useQueryResult.data.tags || []];
            setAppUserEntity(useQueryResult.data);
        }

    }, [useQueryResult.data]);


    useEffect(() => {
        if (isLoggedIn) {
            setTimeout(() => {
                useQueryResult.refetch();
            }, 100); // wait for unsaved notes to be saved, since tags need to be fetched here
        }
        
    }, [isLoggedIn])


    async function fetchCurrentAppUser(): Promise<AppUserEntity> {

        if (!isLoggedIn)
            return initAppUserEntity;

        const url = `${BACKEND_BASE_URL}/app-user/get-current`;

        const jsonResponse = await fetchJson(url, "post");

        // case: fetch error
        if (isResponseError(jsonResponse)) {
            toast("Unexpected Error", "The page could not be loaded completely. Please refresh the page.", "error");
            return initAppUserEntity;
        }

        return jsonResponse;
    }
    

    /**
     * Save given ```appUserToSave``` if has no id or update if has an existing one.
     * 
     * Expecting all fields to present.
     * 
     * @param appUserToSave to save or update. Wont be altered
     */
    async function fetchSave(appUserToSave = appUserEntity): Promise<AppUserEntity | CustomExceptionFormat> {

        // case: falsy arg
        if (!appUserToSave) {
            logError("Failed to save app user. 'appUserToSave' cannot be falsy");
            return CustomExceptionFormatService.getInstance(500, "Failed to save app user. 'appUserToSave' cannot be falsy");
        }

        let appUserToSaveCopy = appUserToSave;

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
        useQueryResult,

        fetchSave,
        fetchLogin,
        fetchLogout
    }
}

export const APP_USER_QUERY_KEY = ["appUser"];
