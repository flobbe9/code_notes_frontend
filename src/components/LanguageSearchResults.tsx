import React, { useRef } from "react";
    import "../assets/styles/LanguageSearchResults.scss";
    import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { moveCursor } from "../helpers/utils";


interface Props extends DefaultProps {

}


/**
 * @since latest
 */
export default function LanguageSearchResults({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "LanguageSearchResults");

    const inputRef = useRef(null);

    // TODO
        // pass list
        // default value = selected element
        // on search result select
            // set input value
            // hide search results
        // on empty search
            // show all possible results

    function handleFocus(event): void {

        // prevent input value select on focus
        moveCursor($(inputRef.current!), 0);
    }

    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            <input 
                className="searchResult" 
                readOnly 
                value="Java" 
                ref={inputRef}
                onFocus={handleFocus}
            />
            <input 
                className="searchResult" 
                readOnly 
                value="Javascript" 
                ref={inputRef}
                onFocus={handleFocus}
            />
                        <input 
                className="searchResult" 
                readOnly 
                value="Javascript" 
                ref={inputRef}
                onFocus={handleFocus}
            />
                        <input 
                className="searchResult" 
                readOnly 
                value="Javascript" 
                ref={inputRef}
                onFocus={handleFocus}
            />
                        <input 
                className="searchResult" 
                readOnly 
                value="Javascript" 
                ref={inputRef}
                onFocus={handleFocus}
            />
                        <input 
                className="searchResult" 
                readOnly 
                value="Javascript" 
                ref={inputRef}
                onFocus={handleFocus}
            />
                        <input 
                className="searchResult" 
                readOnly 
                value="Javascript" 
                ref={inputRef}
                onFocus={handleFocus}
            />

                
            {children}
        </div>
    )
}