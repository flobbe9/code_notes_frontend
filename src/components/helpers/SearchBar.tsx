import React, { CSSProperties, forwardRef, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import "../../assets/styles/SearchBar.css";
import HelperProps from "../../abstract/HelperProps";
import Flex from "./Flex";
import { isObjectFalsy, log } from "../../helpers/utils";
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
        onFocusOut,
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

    const { id, className, style, children, onFocus, ...otherProps } = getCleanDefaultProps(props, "SearchBar");

    const componentRef = useRef(null);
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => inputRef.current!, []);


    useEffect(() => {

        addFocusEvents();
    }, []);


    function handleXIconClick(event): void {

        clearInputValue();
    }


    function clearInputValue(): void {

        getSearchBarInput().val("");
    }


    function addFocusEvents(): void {

        if (disabled)
            return;

        const input = getSearchBarInput();

        input.on("focus", () => setIsFocus(true))
             .on("focusout", (event) => {
                setIsFocus(false);

                if (onFocusOut)
                    onFocusOut(event)
             });
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
        <div>
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
                    onFocus={onFocus}
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
            </Flex>
                    
            {children}
        </div>
    )
})