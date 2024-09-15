
import CryptoJSImpl from '../abstract/CryptoJSImpl';
import { BACKEND_BASE_URL } from '../helpers/constants';
import fetchJson from '../helpers/fetchUtils';
import { log, logError } from '../helpers/utils';
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
        await fetchJson<AppUserEntity>(url, "post", appUserEntityCopy);
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