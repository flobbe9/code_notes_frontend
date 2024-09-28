
import { AppUserRole } from '../abstract/AppUserRole';
import CryptoJSImpl from '../abstract/CryptoJSImpl';
import { TagEntity } from '../abstract/entites/TagEntity';
import { BACKEND_BASE_URL } from '../helpers/constants';
import { fetchAny } from '../helpers/fetchUtils';
import { AppUserEntity } from './../abstract/entites/AppUserEntity';


/**
 * @since 0.0.1
 */
export class AppUserService {
    
    /** List of app user fields that need to be encrypted before caching the app user */
    private static SENSITIVE_FIELDS = ["email", "password"];

    
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