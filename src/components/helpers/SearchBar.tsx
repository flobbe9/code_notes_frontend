import React, { CSSProperties, forwardRef, LegacyRef, useEffect, useRef, useState } from "react";
import "../../assets/styles/SearchBar.css";
import HelperProps from "../../abstract/HelperProps";
import Flex from "./Flex";
import { isObjectFalsy, log } from "../../helpers/utils";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";


interface Props extends HelperProps {

    /** Default is "Search..." */
    placeHolder?: string,
    /** Default is "" */
    title?: string,
    /** Default is "" */
    defaultValue?: string,
    /** Applied to searchInput */
    onKeyDown?: (event?) => void,
    /** Applied to searchInput */
    onKeyUp?: (event?) => void,
    /** Styles for the "delete search value" icon. Default is {} */
    _xIcon?: CSSProperties,
    /** Default is {} */
    _serachIcon?: CSSProperties,
}


/**
 * @since 0.0.1
 */
export default forwardRef(function SearchBar(
    {
        placeHolder = "Search...",
        title = "",
        defaultValue = "",
        disabled = false,
        rendered = true,
        onKeyDown,
        onKeyUp,
        onClick,
        _xIcon = {},
        _serachIcon = {},
        _hover = {},
        _focus = {},
        _disabled = {},
        ...otherProps
    }: Props, 
    inputRef: LegacyRef<HTMLInputElement>
) {

    const [isFocus, setIsFocus] = useState(false);

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "SearchBar");

    const componentRef = useRef(null);


    useEffect(() => {

        toggleIsFocus();
    }, []);


    function handleXIconClick(event): void {

        clearInputValue();
    }


    function clearInputValue(): void {

        getSearchBar().val("");
    }


    function toggleIsFocus(): void {

        if (disabled)
            return;

        const input = getSearchBar();

        input.on("focus", () => setIsFocus(true))
             .on("focusout", () => setIsFocus(false));
    }


    function getSearchBar(): JQuery {

        return $(componentRef.current!).children("#searchInput");
    }
    
    
    /**
     * Indicates wether to use the default disabled style or not.
     * 
     * @returns ```true``` if ```disabled``` and ```_disabled``` style is falsy
     */
    function isDefaultDisabledStyle(): boolean {

        return disabled && isObjectFalsy(_disabled);
    }


    return (
        <Flex 
            id={id} 
            className={className + (isDefaultDisabledStyle() ? " disabledButton" : "")}
            style={{
                ...style,
                ...(disabled ? _disabled : {}),
                ...(isFocus ? _focus : {})
            }}
            rendered={rendered}
            _hover={_hover}
            flexWrap="nowrap"
            verticalAlign="center"
            ref={componentRef}
        >
            {/* Search icon */}
            <i className="fa-solid fa-magnifying-glass" style={_serachIcon}></i>

            {/* Search input */}
            <input 
                id="searchInput"
                className="fullWidth"
                type="text"
                ref={inputRef} 
                placeholder={placeHolder}
                defaultValue={defaultValue}
                title={title}
                disabled={disabled}
                onClick={onClick}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
            />

            {/* X icon */}
            <button 
                id="clearSearchValueButton" 
                className={(!disabled ? "hover" : "")} 
                disabled={disabled} 
                onClick={handleXIconClick}
            >
                <i className="fa-solid fa-xmark m-1" style={_xIcon}></i>
            </button>
                
            {children}
        </Flex>
    )
})