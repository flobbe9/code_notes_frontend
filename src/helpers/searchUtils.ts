import { includesIgnoreCaseTrim, isBlank, isStringFalsy } from "./utils";


/**
 * @param searchStr string to search for
 * @param otherStr string to search in
 * @param considerStrLength if ```true``` the shorter of both strings will become the ```searchStr```. Default is ```true```
 * @returns ```true``` if given ```searchStr``` is included in given ```otherStr``` 
 *          (other the other way round if ```considerStrLength``` is ```true```). Ignores the
 *          case and trims both strings before comparing.
 * 
 *          Blank strings are considered no match, thus will return ```false``` if one string is blank or falsy
 */
function matchStringsIgnoreWhiteSpace(searchStr: string, otherStr: string, considerStrLength = true): boolean {

    // case: falsy args
    if (isBlank(searchStr) || isBlank(otherStr))
        return false;

    // case: look for otherStr inside searchStr
    if (searchStr.length >= otherStr.length || !considerStrLength)
        return includesIgnoreCaseTrim(searchStr, otherStr);

    // case: look for searchStr inside otherStr
    return includesIgnoreCaseTrim(otherStr, searchStr);
}


/**
 * Split both strings and compare them to eachother using {@link matchStringsIgnoreWhiteSpace}.
 * 
 * @param searchStr string to search for
 * @param otherStr string to search in
 * @param considerStrLength if ```true``` the shorter of both strings will become the ```searchStr```. Default is ```true```
 * @param splitStr str to use for splitting given strings. Default is " "
 * @returns ```true``` if at least one substring from ```searchStr``` is matching a substring from ```otherStr```. 
 *          
 *          ```false``` if one of the strings is falsy or blank
 */
export function matchStringsConsiderWhiteSpace(searchStr: string, otherStr: string, considerStrLength = true, splitStr = " "): boolean {
    
    // case: falsy args
    if (isBlank(searchStr) || isBlank(otherStr) || isStringFalsy(splitStr))
        return false;

    const searchStrArray = searchStr.split(splitStr);
    const otherStrArray = otherStr.split(splitStr);

    return !!searchStrArray.find(searchSubStr => 
                otherStrArray.find(otherSubStr => 
                    matchStringsIgnoreWhiteSpace(searchSubStr, otherSubStr, considerStrLength)));
}