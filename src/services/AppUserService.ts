
import CryptoJSImpl from '../abstract/CryptoJSImpl';
import { CustomExceptionFormat } from '../abstract/CustomExceptionFormat';
import { BACKEND_BASE_URL } from '../helpers/constants';
import fetchJson, { fetchAny } from '../helpers/fetchUtils';
import { isBlank, log, logError } from '../helpers/utils';
import { AppUserEntity } from './../abstract/entites/AppUserEntity';


/**
 * @since 0.0.1
 */
export class AppUserService {

    /**
     * Save given ```appUserEntity``` if has no id or update if has an existing one.
     * 
     * Expecting all fields to present.
     * 
     * @param appUserEntity to save or update. Wont be altered
     * @param decrypt indicates whether to decrypt sensitive fields of given ```appUserEntity``` (see {@link decryptSensitiveFields})
     */
    public static async fetchSave(appUserEntity: AppUserEntity, decrypt = true): Promise<void> {

        // case: falsy arg
        if (!appUserEntity) {
            logError("Failed to save app user. 'appUserEntity' cannot be falsy");
            return;
        }

        let appUserEntityCopy = appUserEntity;

        // case: given app user is encrypted
        if (decrypt)
            appUserEntityCopy = this.decryptSensitiveFields(appUserEntity);

        const url = `${BACKEND_BASE_URL}/appUser/save`;
        await fetchJson(url, "post", appUserEntityCopy);
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
            return CustomExceptionFormat.getInstance(400, "Failed to fetch login. 'email' or 'password' are blank");

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
     * @returns ```appUserEntity``` with {@link AppUserEntity.SENSITIVE_FIELDS} beeing encrypted
     */
    public static encryptSensitiveFields(appUserEntity: AppUserEntity): AppUserEntity {

        const cryptoHelper = new CryptoJSImpl();

        AppUserEntity.SENSITIVE_FIELDS.forEach(prop => {
            if (appUserEntity[prop])
                appUserEntity[prop] = cryptoHelper.encrypt(appUserEntity[prop]);
        });

        return appUserEntity;
    }


    /**
     * @param appUserEntity app user to decrypt fields for. Wont be altered
     * @returns a copy of ```appUserEntity``` instance with decrypted {@link AppUserEntity.SENSITIVE_FIELDS}.
     */
    public static decryptSensitiveFields(appUserEntity: AppUserEntity): AppUserEntity {

        const cryptoHelper = new CryptoJSImpl();

        const appUserEntityCopy = AppUserEntity.getInstance(appUserEntity);

        AppUserEntity.SENSITIVE_FIELDS.forEach(prop => {
            if (appUserEntityCopy[prop])
                appUserEntityCopy[prop] = cryptoHelper.decrypt(appUserEntityCopy[prop]);
        });

        return appUserEntityCopy;
    }
}