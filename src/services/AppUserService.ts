
import { AppUserRole } from '../abstract/AppUserRole';
import CryptoJSImpl from '../abstract/CryptoJSImpl';
import { CustomExceptionFormat } from '../abstract/CustomExceptionFormat';
import { TagEntity } from '../abstract/entites/TagEntity';
import { BACKEND_BASE_URL } from '../helpers/constants';
import fetchJson, { fetchAny } from '../helpers/fetchUtils';
import { isBlank, log, logError } from '../helpers/utils';
import { AppUserEntity } from './../abstract/entites/AppUserEntity';
import { CustomExceptionFormatService } from './CustomExceptionFormatService';


/**
 * @since 0.0.1
 */
export class AppUserService {
    
    /** List of app user fields that need to be encrypted before caching the app user */
    private static SENSITIVE_FIELDS = ["email", "password"];


    /**
     * Save given ```appUserEntity``` if has no id or update if has an existing one.
     * 
     * Expecting all fields to present.
     * 
     * @param appUserEntity to save or update. Wont be altered
     * @param decrypt indicates whether to decrypt sensitive fields of given ```appUserEntity``` (see {@link decryptSensitiveFields})
     */
    public static async fetchSave(appUserEntity: AppUserEntity, decrypt = true): Promise<AppUserEntity | CustomExceptionFormat | null> {

        // case: falsy arg
        if (!appUserEntity) {
            logError("Failed to save app user. 'appUserEntity' cannot be falsy");
            return null;
        }

        let appUserEntityCopy = appUserEntity;

        // case: given app user is encrypted
        if (decrypt)
            appUserEntityCopy = this.decryptSensitiveFields(appUserEntity);

        const url = `${BACKEND_BASE_URL}/appUser/save`;
        return await fetchJson(url, "post", appUserEntityCopy);
    }


    /**
     * Fetch login request which will create a session in the browser.
     * 
     * @param email of the app user
     * @param password of the app user
     * @returns the response which is either a ```Response``` object with a csrf token or an error object
     */
    public static async fetchLogin(email: string, password: string): Promise<Response | CustomExceptionFormat> {

        if (isBlank(email) || isBlank(password))
            return CustomExceptionFormatService.getInstance(400, "Failed to fetch login. 'email' or 'password' are blank");

        const url = `${BACKEND_BASE_URL}/login?username=${email}&password=${password}`;

        return await fetchAny(url, "post");
    }
    

    /**
     * Make logout request to backend. Cannot fail
     */
    public static async fetchLogout(): Promise<void> {

        const url = `${BACKEND_BASE_URL}/logout`;

        await fetchAny(url);
    }

    
    /**
     * @param appUserEntity app user to encrypt fields for. Will be altered
     * @returns ```appUserEntity``` with {@link SENSITIVE_FIELDS} beeing encrypted
     */
    public static encryptSensitiveFields(appUserEntity: AppUserEntity): AppUserEntity {

        const cryptoHelper = new CryptoJSImpl();

        this.SENSITIVE_FIELDS.forEach(prop => {
            if (appUserEntity[prop])
                appUserEntity[prop] = cryptoHelper.encrypt(appUserEntity[prop]);
        });

        return appUserEntity;
    }


    /**
     * @param appUserEntity app user to decrypt fields for. Wont be altered
     * @returns a copy of ```appUserEntity``` instance with decrypted {@link SENSITIVE_FIELDS}.
     */
    public static decryptSensitiveFields(appUserEntity: AppUserEntity): AppUserEntity {

        const cryptoHelper = new CryptoJSImpl();

        const appUserEntityCopy = this.getInstance(appUserEntity);

        this.SENSITIVE_FIELDS.forEach(prop => {
            if (appUserEntityCopy[prop])
                appUserEntityCopy[prop] = cryptoHelper.decrypt(appUserEntityCopy[prop]);
        });

        return appUserEntityCopy;
    }

    
    /**
     * Adds given tag to ```appUserEntity.tags``` if not contains.
     * 
     * @param appUserEntity to add tags to
     * @param tagEntity to add to ```this.tags```
     */
    public static addTag(appUserEntity: AppUserEntity, tagEntity: TagEntity): void {

        if (!appUserEntity.tags)
            appUserEntity.tags = [];

        if (!this.isTagEntityPresentInANote(appUserEntity, tagEntity))
            appUserEntity.tags.push(tagEntity);
    }


    /**
     * Remove given tag from ```appUserEntity.tags```.
     * 
     * @param appUserEntity to remove tags from
     * @param tag to remove 
     */
    public static removeTagEntity(appUserEntity: AppUserEntity, tag: TagEntity): void {

        if (!tag || !appUserEntity.tags)
            return;

        const tagIndex = appUserEntity.tags.indexOf(tag);

        appUserEntity.tags.splice(tagIndex, 1);
    }


    /**
     * @param appUserEntity to check tags for
     * @param tag to search
     * @returns ```true``` if given tag is present at least in one note of ```appUserEntity.notes```, else ```false```
     */
    public static isTagEntityPresentInANote(appUserEntity: AppUserEntity, tag: TagEntity): boolean {

        if (!tag || !appUserEntity.notes)
            return false;

        return !!appUserEntity.notes
            .find(noteEntity => 
                !!(noteEntity.tags || [])
                    .find(tagEntity => 
                        tag.name === tagEntity.name))
    }


    /**
     * @returns instance with default values (mostly ```null```)
     */
    public static getDefaultInstance(): AppUserEntity {

        return {
            id: -1, 
            created: "", 
            updated: "", 
            email: "", 
            password: "", 
            role: AppUserRole.USER, 
            tags: null, 
            notes: null
        };
    }
    

    public static getInstance(appUserEntity: AppUserEntity): AppUserEntity {

        return {
            id: appUserEntity.id || null,
            created: appUserEntity.created,
            updated: appUserEntity.updated,
            email: appUserEntity.email,
            password: appUserEntity.password,
            role: appUserEntity.role,
            tags: appUserEntity.tags || null,
            notes: appUserEntity.notes || null
        }
    }
}