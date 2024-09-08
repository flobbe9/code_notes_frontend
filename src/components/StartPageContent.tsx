import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/StartPageContent.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Note from "./noteInput/Note";
import SearchBar from "./helpers/SearchBar";
import { getRandomString, log } from "../helpers/utils";
import { AppContext } from "./App";
import Flex from "./helpers/Flex";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import AddNewNoteButton from "./AddNewNoteButton";
import { StartPageContainerContext } from "./StartPageContainer";
import { useSearchNotes } from "../hooks/useSearchNotes";
import CryptoJSImpl from "../abstract/CryptoJSImpl";
import { CRYPTO_KEY, CRYPTO_IV, BACKEND_BASE_URL } from "../helpers/constants";
import { AppUserRole } from "../abstract/AppUserRole";
import { useAuth } from "../hooks/useAuth";
import Button from "./helpers/Button";
import fetchJson, { fetchAny } from "../helpers/fetchUtils";


interface Props extends DefaultProps {

}


/**
 * Container for all content on start page that is not the side bar.
 * 
 * @since 0.0.1
 */
// TODO: 
    // move selected tags?
    // disabled sidebar tags and search bar if no notes, 
export default function StartPageContent({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageContent", true);
    
    const { appUserEntity, isKeyPressed } = useContext(AppContext);
    
    const [notes, setNotes] = useState<JSX.Element[]>([]);
    const [noteSearchValue, setNoteSearchValue] = useState("");
    const [noteSearchResults, setNoteSearchResults] = useState<NoteEntity[]>([]);

    const { getNoteSearchResults } = useSearchNotes();
    const { selectedTagEntityNames } = useContext(StartPageContainerContext);
    
    const searchInputRef = useRef(null);

    const context = {
        notes,
        setNotes,

        noteSearchResults,

        getNoteByNoteEntity
    }


    const { fetchLogout } = useAuth(appUserEntity.email, appUserEntity.password);


    useEffect(() => {
        handleSearch();

    }, [selectedTagEntityNames]);


    useEffect(() => {
        $(window).on("keydown", handleKeyDown);

        setNotes(mapNoteEntitiesToJsx());

        return () => {
            $(window).off("keydown", handleKeyDown);
        }
    }, []);


    function handleKeyDown(event): void {

        // focus search input on Strg + Shift + F
        if (isKeyPressed("Control") && isKeyPressed("Shift") && event.key === "F") {
            event.preventDefault();
            $(searchInputRef.current!).trigger("focus");
        }
    }


    // TOOD: map in revers for last to be on top?
    function mapNoteEntitiesToJsx(): JSX.Element[] {

        if (!appUserEntity.notes)
            return [];

        return appUserEntity.notes.map(note => 
            getNoteByNoteEntity(note));
    }


    function getNoteByNoteEntity(noteEntity: NoteEntity): JSX.Element {

        const key = getRandomString();
        return <Note noteEntity={noteEntity} key={key} propsKey={key} />
    }


    function handleSearchKeyDown(event): void {

        if (event.key === "Enter")
            handleSearch(event.target.value)
    }


    function handleSearchValueChange(event): void {

        const currentSearchValue = event.target.value;

        handleSearch(currentSearchValue);

        setNoteSearchValue(currentSearchValue);
    }


    function handleSearchXIconClick(event): void {

        handleSearch("");
    }


    function handleSearch(searchValue = noteSearchValue): void {

        const searchResults = getNoteSearchResults(searchValue);

        setNoteSearchResults(searchResults);
    }


    return (
        <StartPageContentContext.Provider value={context}>
            <div 
                id={id} 
                className={className + " fullWidth"}
                style={style}
                {...otherProps}
            >
                {/* SearchBar */}
                <Flex className="mt-3" flexWrap="nowrap" verticalAlign="center">
                    <SearchBar 
                        id="StartPage"
                        className="fullWidth" 
                        placeHolder="Search for note Title or Tag" 
                        title="Search notes (Ctrl+Shift+F)"
                        ref={searchInputRef}
                        disabled={!appUserEntity.notes?.length}
                        onChange={handleSearchValueChange}
                        onKeyUp={handleSearchKeyDown}
                        onXIconClick={handleSearchXIconClick}
                        _focus={{borderColor: "var(--accentColor)"}}
                        _searchIcon={{color: "var(--matteBlackLight)"}}
                    />
                </Flex>

                {/* New Note Button */}
                <Flex className="mt-2 mb-5" horizontalAlign="right">
                    <AddNewNoteButton className={notes.length ? "" : "hover"} />
                    <Button onClickPromise={async (event) => fetchLogout()}>Logout</Button>
                    <Button onClickPromise={async (event) => await fetchAny(`${BACKEND_BASE_URL}/test`)}>test</Button>
                </Flex>

                {/* Notes */}
                {notes}

                {children}
            </div>
        </StartPageContentContext.Provider>
    )
}


export const StartPageContentContext = createContext({
    notes: [<></>],
    setNotes: (notes: JSX.Element[]) => {},

    noteSearchResults: [] as NoteEntity[],

    getNoteByNoteEntity: (noteEntity: NoteEntity) => {return <></>}
})