import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { AppUserEntity } from "../abstract/entites/AppUserEntity";
import { AppContext } from "../components/App";
import { BACKEND_BASE_URL } from "../helpers/constants";
import fetchJson, { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { AppUserService } from "../services/AppUserService";
import { isBlank, log, logError } from "../helpers/utils";
import { AppUserRole } from "../abstract/AppUserRole";
import { NoteInputType } from "../abstract/NoteInputType";
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
            return CustomExceptionFormatService.getInstance(500, "Failed to save app user");
        }

        let appUserToSaveCopy = appUserToSave;

        // case: given app user is encrypted
        if (decrypt)
            appUserToSaveCopy = this.decryptSensitiveFields(appUserToSave);

        const url = `${BACKEND_BASE_URL}/appUser/save`;
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

        fetchSaveAppUserEntity: fetchSave,
        fetchLogin,
        fetchLogout
    }
}

export const APP_USER_QUERY_KEY = ["appUser"];


// TODO: remove in prod
const mockAppUserEntity: AppUserEntity = {
    id: 3,
    created: "2024-09-15 22:21:22.22222",
    updated: "2024-09-15 22:21:22.22222",
    email: "user@user.com",
    password: "$2a$10$PDzuJ0g.FZMEDyXJq70qMuKSCSsS56wilmo5iuzxVFD/LCiMG5/.i", // Abc123,.
    role: AppUserRole.USER,
    tags: [
        { name: "tag14" },
        { name: "docker" },
        { name: "linux" },
        { name: "other stuff" }
    ],
    notes: [
      {
        id: 20,
        title: "bash into",
        noteInputs: [
            {
                value: "const x = 3;\n\nadsf\nasdf",
                type: NoteInputType.CODE,
                programmingLanguage: "Java"
            },
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            },
        ],
        tags: [
            {
                name: "other stuff"
            }
        ]
      },
      {
        id: 19,
        title: "note19",
        noteInputs: [
            {
                value: "some <code>code</code>",
                type: NoteInputType.PLAIN_TEXT
            },
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            },
        ],
        tags: [
            {
                name: "docker"
            },
            {
                name: "linux"
            }
        ]
      },
      {
        id: 18,
        title: "win bash",
        noteInputs: [
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto",
            },
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            }
        ],
        tags: [
            {
                name: "tag14",
            }
        ]
      }
    ]
}