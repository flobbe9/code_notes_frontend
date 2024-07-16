import React, { CSSProperties, forwardRef, Ref, useImperativeHandle, useRef, useState } from "react";
import "../../assets/styles/SearchBar.css";
import HelperProps from "../../abstract/HelperProps";
import Flex from "./Flex";
import { isObjectFalsy } from "../../helpers/utils";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Button from "./Button";


interface Props extends HelperProps {

    /** Default is "Search..." */
    placeHolder?: string,
    /** Default is {} */
    _searchIcon?: CSSProperties,
    /** Default is {} */
    _searchInput?: CSSProperties,
    /** Styles for the "delete search value" icon. Default is {} */
    _xIcon?: CSSProperties,
}

// TODO: remove outer div, continue here
    // fix language searchbar

/**
 * @since 0.0.1
 */
export default forwardRef(function SearchBar(
    {
        placeHolder = "Search...",
        title = placeHolder || "Search bar",
        defaultValue = "",
        disabled = false,
        rendered = true,
        onKeyDown,
        onKeyUp,
        onClick,
        onFocus,
        onBlur,
        _searchIcon = {},
        _searchInput = {},
        _xIcon = {},
        _hover = {},
        _focus = {},
        _disabled = {},
        ...props
    }: Props, 
    ref: Ref<HTMLInputElement>
) {

    const [isFocus, setIsFocus] = useState(false);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "SearchBar");

    const componentRef = useRef(null);
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => inputRef.current!, []);


    function handleXIconClick(event): void {

        clearInputValue();
    }


    function clearInputValue(): void {

        getSearchBarInput().val("");
    }


    function handleFocus(event): void {

        if (disabled)
            return;

        setIsFocus(true);

        if (onFocus)
            onFocus(event);
    }


    function handleBlur(event): void {

        if (disabled)
            return;

        setIsFocus(false);

        if (onBlur)
            onBlur(event);
    }


    function getSearchBarInput(): JQuery {

        return $(componentRef.current!).children(".searchInput");
    }
    
    
    /**
     * Indicates whether to use the default disabled style or not.
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
            {...otherProps}
        >
            {/* Search icon */}
            <i className="fa-solid fa-magnifying-glass" style={_searchIcon}></i>

            {/* Search input */}
            <input 
                className="fullWidth dontMarkPlaceholder searchInput"
                style={_searchInput}
                type="text"
                ref={inputRef} 
                placeholder={placeHolder}
                defaultValue={defaultValue}
                title={title}
                disabled={disabled}
                spellCheck={false}
                tabIndex={otherProps.tabIndex}
                onClick={onClick}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />

            {/* X icon */}
            {/* TODO: clear search results as well as search input */}
            <Button 
                className={"clearSearchValueButton " + (!disabled ? "hover" : "")} 
                disabled={disabled} 
                onClick={handleXIconClick}
                title="Clear search"
            >
                <i className="fa-solid fa-xmark m-1" style={_xIcon}></i>
            </Button>
            {children}
        </Flex>
    )
})