import React, { ChangeEvent, createContext, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import "../../../assets/styles/StartPageSideBar.scss";
import { AppContext } from "../../App";
import { AppFetchContext } from "../../AppFetchContextHolder";
import Button from "../../helpers/Button";
import SearchBar from "../../helpers/SearchBar";
import SideBar from "../../helpers/SideBar";
import { StartPageContainerContext } from "./StartPageContainer";
import StartPageSideBarTagList from "./StartPageSideBarTagList";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function StartPageSideBar({...props}: Props) {

    /** Tag search value eagerly updated on change event */
    const [searchValue, setSearchValue] = useState("");

    /** Refers to ```selectedTagEntityNames``` beeing not empty */
    const [anyTagsSelected, setAnyTagsSelected] = useState(false);

    const { isKeyPressed } = useContext(AppContext);
    const { appUserEntity, isLoggedIn } = useContext(AppFetchContext);
    const { isShowSideBar, setIsShowSideBar, setSelectedTagEntityNames, selectedTagEntityNames } = useContext(StartPageContainerContext);

    const { children, ...otherProps } = getCleanDefaultProps(props, "StartPageSideBar", true);

    const componentRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLInputElement>(null);

    const context = {
        searchValue
    }


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);


    useEffect(() => {
        setAnyTagsSelected(!!selectedTagEntityNames.size)

    }, [selectedTagEntityNames]);


    function handleKeyDown(event: KeyboardEvent): void {

        const sideBarDislay = (componentRef.current!.querySelector(".SideBar-right") as HTMLElement).style.display;
        const keyName = event.key;

        if (isKeyPressed("Control") && keyName === "b") {
            event.preventDefault();
            // NOTE: don't use the state in here because it does not update after this event handler is beeing added to window
            setIsShowSideBar(sideBarDislay !== "block");
        }
    }


    function handleSearchBarChange(event: ChangeEvent): void {

        setSearchValue((event.target as HTMLInputElement).value);
    }


    function handleSearchBarXIconClick(): void {

        setSearchValue("");
    }


    function handleResetClick(): void {

        setSelectedTagEntityNames(new Set());
        searchBarRef.current!.value = "";
        setSearchValue("");
    }


    return (
        <StartPageSideBarContext.Provider value={context}>
            <SideBar 
                ref={componentRef}
                isVisible={isShowSideBar}
                setIsVisible={setIsShowSideBar}
                toggleIcon={<i className="fa-solid fa-filter fa-xl" title="Filter by tags (Ctrl + B)"></i>}
                {...otherProps}
            >
                {/* SearchBar */}
                <SearchBar 
                    placeHolder="Search tags..."
                    title="Search tags"
                    disabled={!appUserEntity.tags?.length || !isLoggedIn}
                    ref={searchBarRef}
                    onChange={handleSearchBarChange}
                    onXIconClick={handleSearchBarXIconClick}
                    _focus={{borderColor: "var(--accentColor)"}} 
                    _searchIcon={{color: "var(--iconColor)"}}
                    _searchInput={{color: "white"}} 
                    _xIcon={{color: "var(--iconColor)"}}
                />

                {/* Reset button */}
                {/* NOTE: don't use flex here */}
                <div className="mt-3 textRight">
                    <Button 
                        className="resetButton hover" 
                        title="Reset tag filter" 
                        disabled={!anyTagsSelected || !isLoggedIn}
                        onClick={handleResetClick} 
                    >
                        Reset   
                    </Button>
                </div>

                <hr />

                {/* Tag checkboxes */}
                <div className="startPageSideBarListContainer">
                    <StartPageSideBarTagList disabled={!appUserEntity.tags?.length || !isLoggedIn} />
                </div>
            </SideBar>
        </StartPageSideBarContext.Provider>
    )
}


export const StartPageSideBarContext = createContext({
    searchValue: ""
})