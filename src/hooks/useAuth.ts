import { useContext, useEffect, useState } from "react";
import { isBlank, log } from "../helpers/utils";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppContext } from "../components/App";
import { BACKEND_BASE_URL } from "../helpers/constants";
import fetchJson, { fetchAny, isJsonResponseError } from "../helpers/fetchUtils";
import { AppUserService } from "../services/AppUserService";


/**
 * Calling this hook with ```email``` and ```password``` not beeing ```null``` will login and fetch the app user.
 * 
 * @param email raw email input
 * @param password raw password input
 * @since 0.0.1
 */
export function useAuth(email: string | null, password: string | null): {
    /** Either the fetched and encrypted ```fetchedAppUserEntity``` or ```null``` if no login input or login error */
    fetchedAppUserEntity: AppUserEntity | null,
    fetchLogout: () => void
} {

    const [fetchedAppUserEntity, setFetchedAppUserEntity] = useState<AppUserEntity | null>(null);

    const { toast } = useContext(AppContext);

    const queryKey = ["appUser"];
    const queryClient = useQueryClient();


    const { data } = useQuery<AppUserEntity | null>({
        queryKey: queryKey,
        queryFn: fetchLoginReturnAppUser,
        initialData: queryClient.getQueryData(queryKey)
    });


    useEffect(() => {
        if (data)
            setFetchedAppUserEntity(data);

    }, [email, password, data]);


    /**
     * Fetch login if email and password are provided, then partially encrypt app user response.
     * 
     * Toast on fetch error (but not if no login input is provided).
     * 
     * @returns partially encrypted app user entity or ```null``` if no login input or fetch error
     */
    async function fetchLoginReturnAppUser(): Promise<AppUserEntity | null> {

        // case: hook was not triggered by login
        if (email === null || password === null)
            return null;

        // case: falsy user input
        if (isBlank(email) || isBlank(password)) {
            toast("Login failed", "Please fill out both email and password field.", "error");
            return null;
        }

        const url = `${BACKEND_BASE_URL}/login?username=${email}&password=${password}`;
        const jsonResponse = await fetchJson<AppUserEntity>(url, "post");

        // case: bad credentials or fetch error
        if (isJsonResponseError(jsonResponse)) {
            handleLoginFailure(jsonResponse.status)
            return null;
        }

        return AppUserService.encryptSensitiveFields(jsonResponse as AppUserEntity);
    }


    function handleLoginFailure(status: number): void {

        if (status === 401)
            toast("Bad credentials", "Email or password incorrect. Please try again.", "error");
            
        else
            toast("Login failed", "An unexpected error occured.Refreshing the page might help.", "error");
    }


    /**
     * Make logout request to backend. Cannot fail
     */
    async function fetchLogout(): Promise<void> {

        const url = `${BACKEND_BASE_URL}/logout`;

        await fetchAny(url);
    }


    return {
        fetchedAppUserEntity,
        fetchLogout
    };
}