import CryptoJS from "crypto-js";
import { isBlank, log, logError, stripTimeFromDate } from "../helpers/utils";


/**
 * Class defining simple encryption methods using "CryptoJS".
 * 
 * @since 0.1.0
 */
export default class CryptoJSImpl {

    private key: CryptoJS.lib.WordArray;

    private iv: CryptoJS.lib.WordArray;


    /**
     * @param key secret string used by alogrithm. Needs to be 22 chars long 
     * @param iv secret string used by alogrithm. Necessary for encryption to always return the same value. 
     *           Needs to be 22 chars long
     */
    constructor(key: string, iv: string) {

        // case: falsy params
        if (!this.areConstructorParamsValid(key, iv)) {
            logError("Failed to instantiate CryptoJsImpl. Invalid constructor params.");
            return;
        }

        this.key = CryptoJS.enc.Base64.parse(key);
        this.iv = CryptoJS.enc.Base64.parse(iv);
    }


    public encrypt(value: CryptoJS.lib.WordArray | string): CryptoJS.lib.CipherParams {

        return CryptoJS.AES.encrypt(value, this.key, { iv: this.iv });
    }


    public decrypt(encryptedValue: CryptoJS.lib.CipherParams | string): CryptoJS.lib.WordArray {

        return CryptoJS.AES.decrypt(encryptedValue, this.key, { iv: this.iv });
    }


    /**
     * @param wordArray to convert to string (produced by ```decrypt()``` e.g.)
     * @returns readable string representation of given wordArray
     */
    public wordArrayToString(wordArray: CryptoJS.lib.WordArray): string {

        return wordArray ? wordArray.toString(CryptoJS.enc.Utf8) : "";
    }


    public hash(value: CryptoJS.lib.WordArray | string, cfg?: object): string {

        return CryptoJS.SHA256(value).toString();
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
     * Validate constructor params.
     * 
     * @param key 
     * @param iv 
     * @returns true if all params are valid
     */
    private areConstructorParamsValid(key: string, iv: string): boolean {

        if (isBlank(key) || isBlank(iv))
            return false;

        // length necessary for algorithm to work
        if (key.length !== 22 || iv.length !== 22)
            return false;

        return true;
    }
}