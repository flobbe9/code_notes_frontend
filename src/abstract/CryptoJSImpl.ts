import CryptoJS from "crypto-js";
import { isBlank, logError, stripTimeFromDate } from "../helpers/utils";
import { CRYPTO_IV, CRYPTO_KEY } from "../helpers/constants";


/**
 * Class defining simple encryption methods using "CryptoJS".
 * 
 * @since 0.1.0
 */
export default class CryptoJSImpl {

    private key: CryptoJS.lib.WordArray;

    private iv: CryptoJS.lib.WordArray;


    /**
     * @param key secret string used by alogrithm. Needs to be 22 chars long. Default is {@link CRYPTO_KEY}.
     * @param iv secret string used by alogrithm. Necessary for encryption to always return the same value. Default is {@link CRYPTO_IV}
     *           Needs to be 22 chars long
     */
    constructor(key = CRYPTO_KEY, iv = CRYPTO_IV) {

        // case: falsy params
        if (!this.areConstructorParamsValid(key, iv)) {
            logError("Failed to instantiate CryptoJsImpl. Invalid constructor params.");
            return;
        }

        this.key = CryptoJS.enc.Base64.parse(key);
        this.iv = CryptoJS.enc.Base64.parse(iv);
    }


    public encrypt(value: CryptoJS.lib.WordArray | string): string {

        return CryptoJS.AES.encrypt(value, this.key, { iv: this.iv }).toString();
    }


    public decrypt(encryptedValue: CryptoJS.lib.CipherParams | string): string {

        return this.wordArrayToString(CryptoJS.AES.decrypt(encryptedValue, this.key, { iv: this.iv }));
    }


    /**
     * @param value to generate a hash for
     * @param cfg config object. See ```CipherOption``` interface in CryptoJS lib.
     * @returns the generated hash
     */
    public hash(value: CryptoJS.lib.WordArray | string, cfg?: object): string {

        return CryptoJS.SHA256(value, cfg).toString();
    }


    /**
     * 
     * @param date to generate a hash for
     * @returns ```this.hash()``` with the time stripped from the date and then passing ```date.getTime()```
     */
    public hashDate(date = new Date()): string {

        return this.hash(stripTimeFromDate(date).getTime().toString());
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
     * @param key 
     * @param iv 
     * @returns true if all params are valid
     */
    private areConstructorParamsValid(key: string, iv: string): boolean {

        if (isBlank(key) || isBlank(iv)) {
            logError("Either key or iv are blank.");
            return false;
        }

        // length necessary for algorithm to work
        if (key.length !== 22 || iv.length !== 22) {
            logError("Either key or iv length are unexpected.");
            return false;
        }

        return true;
    }
}