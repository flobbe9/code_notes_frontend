import CryptoJS from "crypto-js";
import { CRYPTO_IV, CRYPTO_KEY } from "../helpers/constants";
import { isBlank, logError } from "../helpers/utils";


/**
 * Class defining simple encryption methods using "CryptoJS".
 * NOTE: Don't use this for sensitive data since there's no way of storing secrets
 * inside a react app. Not passing key and iv into production build.
 * 
 * @since 0.1.0
 */
export default class CryptoJSImpl {

    private key: CryptoJS.lib.WordArray;

    private iv: CryptoJS.lib.WordArray;


    /**
     * @param key secret string used by alogrithm. Needs to be either 16 or 32 chars long. Default is {@link CRYPTO_KEY}.
     * @param iv secret string used by alogrithm. Necessary for encryption to always return the same value. Default is {@link CRYPTO_IV}
     *           Needs to be 16 chars long
     */
    constructor(key = CRYPTO_KEY, iv = CRYPTO_IV) {

        // case: falsy params
        if (!this.areConstructorParamsValid(key, iv)) {
            logError("Failed to instantiate CryptoJsImpl. Invalid constructor params.");
            return;
        }

        this.key = CryptoJS.lib.WordArray.create(new TextEncoder().encode(key))
        this.iv = CryptoJS.lib.WordArray.create(new TextEncoder().encode(iv))
    }

    
    /**
     * 
     * @param decryptedValue to decrypt
     * @returns the encrypted value or an empty string
     */
    public encrypt(value: CryptoJS.lib.WordArray | string): string {

        return CryptoJS.AES.encrypt(value, this.key, { iv: this.iv }).toString();
    }


    /**
     * 
     * @param encryptedValue to decrypt
     * @returns the decrypted value or an empty string
     */
    public decrypt(encryptedValue: CryptoJS.lib.CipherParams | string): string {

        return this.wordArrayToString(CryptoJS.AES.decrypt(encryptedValue, this.key, { iv: this.iv }));
    }


    /**
     * @param rawValue to generate a hash for
     * @param config config object. See ```CipherOption``` interface in CryptoJS lib.
     * @returns the generated hash
     */
    public hashSha256(rawValue: CryptoJS.lib.WordArray | string, config?: object): string {

        return CryptoJS.SHA256(rawValue, config).toString();
    }


    /**
     * @param rawValue that, if hashed, is supposed to match the ```comparisonHash```
     * @param comparisonHash to compare to hashed ```rawValue```
     * @param config see ```CryptoJS.SHA256()``` method
     * @returns ```true``` if given ```comparisonHash``` is the hashed equal to given ```rawValue```
     */
    public hashSha256Matches(rawValue: CryptoJS.lib.WordArray | string, comparisonHash: string, config?: object): boolean {

        return this.hashSha256(rawValue, config) === comparisonHash;
    }


    /**
     * @param wordArray to convert to string (produced by ```decrypt()``` e.g.)
     * @returns readable string representation of given wordArray
     */
    private wordArrayToString(wordArray: CryptoJS.lib.WordArray): string {

        return wordArray ? wordArray.toString(CryptoJS.enc.Utf8) : "";
    }


    /**
     * Validate constructor params.
     * 
     * @param key needs to be either 16 or 32 chars long
     * @param iv needs to be 16 chars long
     * @returns true if all params are valid
     */
    private areConstructorParamsValid(key: string, iv: string): boolean {

        if (isBlank(key) || isBlank(iv)) {
            logError("Either key or iv are blank.");
            return false;
        }

        if ((key.length !== 16 && key.length !== 32) || iv.length !== 16) {
            logError("Either key or iv length are unexpected.");
            return false;
        }

        return true;
    }
}