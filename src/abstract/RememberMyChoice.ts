/** 
 * Key for localStorage used to remember confirm popup choices.
 * 
 * @since 0.0.1
 * @see ```<Confirm>```
 */
export type RememberMyChoiceKey = 
    "deleteNote" |
    "deleteNoteInput" |
    "discardChangesLogout" |
    "discardChangesChangeNotePage";


/**
 * Value in localStorage used to remember confirm popup choices.
 * 
 * @since 0.0.1
 * @see ```<Confirm>```
*/
export type RememberMyChoiceValue = keyof typeof rememberMyChoiceValueDef;

/**
 * @param str 
 * @returns 
 */
export function isRememberMyChoiceValue(str: string): str is RememberMyChoiceValue {
    
    return !!str && Object.keys(rememberMyChoiceValueDef).includes(str);
}

const rememberMyChoiceValueDef: { cancel: boolean, confirm: boolean } = {
    cancel: false,
    confirm: true
}