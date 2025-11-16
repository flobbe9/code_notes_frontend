// import { FetchConfig } from "@/abstracts/CustomFetchOptions";
// import { CustomUseQueryConfig } from "@/abstracts/CustomUseQueryConfig";
// import { logTrace } from "@/helpers/logUtils";
// import { DefinedUseQueryResult, useQueryClient } from "@tanstack/react-query";
// import { useEffect } from "react";
// import { BackendApiResponseType, useBackendApi } from "./useBackendApi";
// import { useIsLoggedIn } from "./useIsLoggedIn";

// /**
//  * Fetch using {@link useBackendApi} but only if currently logged in in order to avoid
//  * 401 console errors. 
//  * 
//  * Clear cache once logged out.
//  * 
//  * @param fetchConfig see {@link useBackendApi}
//  * @param cacheOptions see {@link useBackendApi}
//  * @type T the expected return type of the fetch call
//  * @returns DefinedUseQueryResult with data of type `T` or `null` if not logged in
//  * @since 0.0.1
//  * @author f.schikarski
//  */
// export function useBackendApiAuthenticated<T extends BackendApiResponseType>(
//     fetchConfig: FetchConfig,
//     cacheConfig: CustomUseQueryConfig
// ): DefinedUseQueryResult<T> {
//     const { data: isLoggedIn, isPending: isLoggedInPending, isFetching: isLoggedInFetching } = useIsLoggedIn();

//     const queryClient = useQueryClient();
//     const queryResult = useBackendApi<T>(
//         fetchConfig, 
//         {
//             ...cacheConfig,
//             fetchOnMount: false // handle fetch on mount in this hook instead, depending on isLoggedIn
//         }
//     );

//     useEffect(() => {
//         clearCacheIfLoggedOut();
//         refetchIfLoggedIn();
        
//     }, [isLoggedIn, isLoggedInPending, isLoggedInFetching])

//     function clearCacheIfLoggedOut(): void {
//         if (isLoggedInPending || isLoggedInFetching) {
//             logTrace("Still fetching isLoggedIn...", fetchConfig.url);
//             return;
//         }

//         if (!isLoggedIn) {
//             logTrace("logged out, whiping cache", fetchConfig.url)
//             queryClient.setQueryData(cacheConfig.queryKey, null);
//             return;
//         }
//     }
    
//     function refetchIfLoggedIn() {
//         if (isLoggedIn && !isLoggedInFetching && !isLoggedInPending && cacheConfig.fetchOnMount)
//             queryResult.refetch();
//     }

//     return queryResult;
// }

