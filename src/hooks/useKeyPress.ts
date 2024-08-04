import { useEffect, useState } from "react";
import { isStringFalsy, log, logWarn } from "../helpers/utils";


/**
 * Hook handling indicating whether a key is pressed or not. 
 * 
 * @param checkAllKeys if ```true``` every key press will update the state with the ```pressedKeyList```. This may
 *                     result in performance decrease. Default is ```false```
 * @since 0.0.1
 */
export default function useKeyPress(checkAllKeys = false) {

    /** List of key names (```event.key```) that are currently pressed */
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());


    useEffect(() => {
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);


    function addPressedKey(keyName: string): void {

        // case: falsy param
        if (isStringFalsy(keyName)) {
            logWarn("Failed to add pressed key to list. 'keyName' is falsy");
            return;
        }

        setPressedKeys(pressedKeys.add(keyName));
    }


    function removePressedKey(keyName: string): void {

        // case: falsy param
        if (isStringFalsy(keyName)) {
            logWarn("Failed to remove pressed key to list. 'keyName' is falsy");
            return;
        }

        pressedKeys.delete(keyName);

        setPressedKeys(new Set(pressedKeys));
    }


    function handleKeyDown(event): void {
        
        const keyName = event.key;

        if (!isKeyConsideredForList(keyName))
            return;

        addPressedKey(keyName);        
    }


    function handleKeyUp(event): void {

        const keyName = event.key;

        if (!isKeyConsideredForList(keyName))
            return;
    
        removePressedKey(keyName);        
    }


    /**
     * Indicates whether a key should be considered for the ```pressedKeys``` list or not. 
     * 
     * In order to prevent to many state changes only "control kind of keys" are considered, e.g. "Control" or "Meta".
     * This applies only if ```checkAllKeys === false``` (which is the default).
     * 
     * @param keyName name of key to check
     * @returns ```true``` if ```keyName``` is longer than 1 character or ```checkAllKeys === true```
     */
    function isKeyConsideredForList(keyName: string): boolean {

        return checkAllKeys === true || (!isStringFalsy(keyName) && keyName.length > 1);
    }


    /**
     * 
     * @param keyName name of key to check
     * @returns ```true``` if given key is currently pressed, else false. Note that only certain keys are considered for this check. 
     *          See {@link isKeyConsideredForList}
     */
    function isKeyPressed(keyName: string): boolean {

        // case: falsy param
        if (isStringFalsy(keyName)) {
            logWarn("Failed to determine if key is pressed. 'keyName' is falsy");
            return false;
        }

        return pressedKeys.has(keyName);
    }


    return { isKeyPressed };
}