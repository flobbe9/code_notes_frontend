import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppFetchContext } from "../components/AppFetchContextHolder";
import { CSRF_TOKEN_URL_QUERY_PARAM } from "../helpers/constants";
import { RouteContext } from "../components/RouteContextHolder";
import { setCsrfToken, getCsrfToken } from "../helpers/projectUtils";


/**
 * Attempt to retrieve csrf token from url query param on render. Do nothing if csrf token is not present.
 * 
 * Does not fetch. 
 * 
 * Needs to be wrapped in ```<BrowserRouter>``` and ```<AppFetchContextHolder>``` since ```useNavigate``` and global fetch states are used.
 * 
 * @since 0.0.1
 */
export function useCsrfToken() {

    const [queryParams, setQueryParams] = useSearchParams();
    const navigate = useNavigate();

    const { clearUrlQueryParams } = useContext(RouteContext);
    const { isLoggedIn, isLoggedInUseQueryResult } = useContext(AppFetchContext);


    useEffect(() => {
        if (!dontGetCsrfToken())
            encryptAndCache();

    }, [isLoggedIn, isLoggedInUseQueryResult.isFetched]);


    function encryptAndCache(): void {

        const csrfToken = getCsrfTokenFromUrl();

        if (!csrfToken) 
            return;

        setCsrfToken(csrfToken);
    }


    /**
     * Attempts to retrieve the csrf token from url query param. The csrf token is expected to be unencrypted.
     * 
     * If (and only if) the csrf token is retrieved, the method will navigate to the current path, removing all current query params. Will then 
     * delete the last browser history entry.
     * 
     * @returns the raw csrf token or ```null``` if not present
     */
    function getCsrfTokenFromUrl(): string | null {

        const csrfToken = queryParams.get(CSRF_TOKEN_URL_QUERY_PARAM);

        // case: no csrf token in url
        if (!csrfToken) 
            return null;

        clearUrlQueryParams();

        return csrfToken;
    }


    /**
     * Indicates whether not to retrieve the csrf token. That is when either not logged in OR ```isLoggedIn``` state not
     * fetched yet OR a csrf token is already present in cache.
     * 
     * @return ```true``` if csrf token should NOT be retrieved (if one of the above conditions is ```true```)
     */
    function dontGetCsrfToken(): boolean {

        const currentCsrfToken = getCsrfToken();

        return !isLoggedIn || !isLoggedInUseQueryResult.isFetched || !!currentCsrfToken;
    }
}

/** For cache, dont confuse with ```CSRF_TOKEN_URL_QUERY_PARAM``` :) */
export const CSRF_TOKEN_QUERY_KEY = "csrfToken";