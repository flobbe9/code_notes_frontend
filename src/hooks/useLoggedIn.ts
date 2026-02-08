import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { AppContext } from "@/context/AppContext";
import { BACKEND_BASE_URL } from "../helpers/constants";
import { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { useLocation } from "react-router-dom";


/**
 * Determine if current session is valid and cache response. Will revalidate on navigate and clear cache and states if not logged in.
 * 
 * @since 0.0.1
 */
export function useLoggedIn() {
    
    const { toast } = useContext(AppContext);

    const queryClient = useQueryClient();

    const location = useLocation();


    const useQueryResult = useQuery<boolean>({
        queryKey: LOGGED_IN_QUERY_KEY,
        queryFn: fetchLoggedIn,
        initialData: queryClient.getQueryData(LOGGED_IN_QUERY_KEY) || false,
    });


    useEffect(() => {
        useQueryResult.refetch();

    }, [location]);


    /**
     * Determines if current session is valid. Status 401 is expected if session is invalid, any other "bad" status will be toasted.
     * 
     * @returns ```true``` if login fetch request is status 200, else false
     */
    async function fetchLoggedIn(): Promise<boolean> {
        
        const url = `${BACKEND_BASE_URL}/app-user/check-logged-in`;

        const response = await fetchAny(url);

        if (isResponseError(response)) {
            toast("Unexpected Error", "The page could not be loaded completely. Please refresh the page.", "error");
            return false;
        }

        return await response.text() === "true";
    }


    return useQueryResult;
}


export const LOGGED_IN_QUERY_KEY = ["loggedIn"];
