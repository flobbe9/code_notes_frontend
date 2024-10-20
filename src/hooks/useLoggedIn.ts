import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../components/App";
import { BACKEND_BASE_URL } from "../helpers/constants";
import fetchJson, { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { log } from "../helpers/utils";


/**
 * Determine if current session is valid and cache response.
 * 
 * @since 0.0.1
 */
export function useLoggedIn() {
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { toast } = useContext(AppContext);

    const queryClient = useQueryClient();


    const { data, isFetched } = useQuery<boolean>({
        queryKey: LOGGED_IN_USER_QUERY_KEY,
        queryFn: fetchLoggedIn,
        initialData: queryClient.getQueryData(LOGGED_IN_USER_QUERY_KEY) || false,
    });


    useEffect(() => {
        if (data)
            setIsLoggedIn(data);

    }, [data]);


    /**
     * Determines if current session is valid. Status 401 is expected if session is invalid, any other "bad" status will be toasted.
     * 
     * @returns ```true``` if login fetch request is status 200, else false
     */
    async function fetchLoggedIn(): Promise<boolean> {

        const url = `${BACKEND_BASE_URL}/app-user/check-logged-in`;

        const jsonResponse = await fetchAny(url);

        if (isResponseError(jsonResponse)) {
            toast("Unexpected Error", "The page could not be loaded completely. Please refresh the page.", "error");

            // TODO: logout if still logged in but 401
            // else ()

            return false;
        }

        return await jsonResponse.text() === "true";
    }


    return {
        isLoggedIn,
        setIsLoggedIn,
        isLoggedInFetched: isFetched
    }
}


export const LOGGED_IN_USER_QUERY_KEY = ["loggedIn"];