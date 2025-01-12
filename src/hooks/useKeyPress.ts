import { useState } from "react";
import { isStringFalsy, logDebug, logWarn } from "../helpers/utils";


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


    function addPressedKey(keyName: string): void {

        // case: falsy param
        if (isStringFalsy(keyName)) {
            logDebug(`Failed to add pressed key to list. 'keyName' ${keyName} is falsy`);
            return;
        }

        setPressedKeys(pressedKeys.add(keyName));
    }


    function removePressedKey(keyName: string): void {

        // case: falsy param
        if (isStringFalsy(keyName)) {
            logDebug(`Failed to remove pressed key from list. 'keyName' ${keyName} is falsy`);
            return;
        }

        pressedKeys.delete(keyName);

        setPressedKeys(new Set(pressedKeys));
    }


    function handleKeyDownUseKeyPress(event): void {

        const keyName = event.key;

        if (!isKeyConsideredForList(keyName))
            return;

        addPressedKey(keyName);        
    }


    function handleKeyUpUseKeyPress(event): void {

        const keyName = event.key;

        if (!isKeyConsideredForList(keyName))
            return;
    
        removePressedKey(keyName);        
    }


    /**
     * Indicates whether a key should be considered for the ```pressedKeys``` list or not. 
     * 
     * In order to prevent too many state changes only "control kind of keys" are considered, e.g. "Control" or "Meta".
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


    /**
     * @returns ```true``` if the list of pressed keys contains at least one "control" kind of key (that is a key that
     *          doesn't take up or removes any space, e.g. "Shift" or "Control")
     */
    function isControlKeyPressed(): boolean {

        // iterate
        const keysToIgnore = new Set(["Space", "Enter", "Backspace", "Delete"]);

        for (const pressedKey of pressedKeys) 
            // case: key name is longer than 1 char but not contained in ignore list
            if (!keysToIgnore.has(pressedKey) && pressedKey.length > 1)
                return true;
        
        return false;
    }


    return { 
        isKeyPressed, 
        isControlKeyPressed, 
        handleKeyDownUseKeyPress,
        handleKeyUpUseKeyPress
    };
}