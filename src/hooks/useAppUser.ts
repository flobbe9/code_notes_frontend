import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { AppContext } from "../components/App";
import { BACKEND_BASE_URL } from "../helpers/constants";
import fetchJson, { isResponseError } from "../helpers/fetchUtils";
import { AppUserService } from "../services/AppUserService";


/**
 * Fetch current app user on render (only if ```isLoggedIn```) and cache.
 * 
 * @since 0.0.1
 */
export function useAppUser() {

    const { setAppUserEntity, toast, isLoggedIn } = useContext(AppContext);

    const queryClient = useQueryClient();


    const { data } = useQuery<AppUserEntity | null>({
        queryKey: APP_USER_QUERY_KEY,
        queryFn: fetchCurrentAppUser,
        initialData: queryClient.getQueryData(APP_USER_QUERY_KEY)
    });


    useEffect(() => {
        if (data)
            setAppUserEntity(data);

    }, [data]);


    async function fetchCurrentAppUser(): Promise<AppUserEntity | null> {

        if (!isLoggedIn)
            return null;

        const url = `${BACKEND_BASE_URL}/appUser/getCurrent`;

        const jsonResponse = await fetchJson(url, "post");

        // case: fetch error
        if (isResponseError(jsonResponse)) {
            // TODO: handle 403 (everywhere)
            // case: csrf token gone (for whatever)
            // if (jsonResponse.status === 403)
            //     toast("Session invalid", "Your session has become invalid. Please login again.", "error");
            // else
                toast("Unexpected Error", "The page could not be loaded completely. Please refresh the page.", "error");
            return null;
        }

        return AppUserService.encryptSensitiveFields(jsonResponse);
    }
}

export const APP_USER_QUERY_KEY = ["appUser"];