import $ from "jquery";
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
import { SearchNoteHelper } from "../helpers/SearchNoteHelper";
import { AppFetchContext } from "./AppFetchContextHolder";
import PendingFetchHelper from "./helpers/PendingFetchHelper";


interface Props extends DefaultProps {

}


/**
 * Container for all content on start page that is not the side bar.
 * 
 * @since 0.0.1
 */
// TODO: 
    // move selected tags?
export default function StartPageContent({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageContent", true);
    
    const [notes, setNotes] = useState<JSX.Element[]>([]);
    const [noteSearchValue, setNoteSearchValue] = useState("");
    const [noteSearchResults, setNoteSearchResults] = useState<NoteEntity[]>([]);
    const [isSearchingNotes, setIsSearchingNotes] = useState(false);
    
    const { isKeyPressed } = useContext(AppContext);
    const { noteEntities, isFetchNoteEntitiesTakingLonger, noteUseQueryResult } = useContext(AppFetchContext);
    const { selectedTagEntityNames } = useContext(StartPageContainerContext);
    const searchNoteHelper = new SearchNoteHelper(noteEntities, selectedTagEntityNames);
    
    const searchInputRef = useRef(null);

    const context = {
        notes,
        setNotes,

        noteSearchResults,
        isSearchingNotes,
        setIsSearchingNotes,

        getNoteByNoteEntity
    }


    useEffect(() => {
        $(window).on("keydown", handleKeyDown);

        setNotes(mapNoteEntitiesToJsx());

        return () => {
            $(window).off("keydown", handleKeyDown);
        }
    }, [noteEntities]);


    useEffect(() => {
        handleSearch();

    }, [selectedTagEntityNames]);


    function handleKeyDown(event): void {

        // focus search input on Strg + Shift + F
        if (isKeyPressed("Control") && isKeyPressed("Shift") && event.key === "F") {
            event.preventDefault();
            $(searchInputRef.current!).trigger("focus");
        }
    }


    // TOOD: map in revers for last to be on top?
    function mapNoteEntitiesToJsx(): JSX.Element[] {

        if (!noteEntities)
            return [];

        return noteEntities.map(noteEntity => 
            getNoteByNoteEntity(noteEntity));
    }


    function getNoteByNoteEntity(noteEntity: NoteEntity): JSX.Element {

        const key = getRandomString();
        return <Note noteEntity={noteEntity} key={key} propsKey={key} />
    }


    function handleSearchKeyDown(event): void {
        // set is search

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

        const searchResults = searchNoteHelper.getNoteSearchResults(searchValue);

        setNoteSearchResults(searchResults);
    }


    return (
        <StartPageContentContext.Provider value={context}>
            <PendingFetchHelper 
                isFetchTakingLong={isFetchNoteEntitiesTakingLonger} 
                useQueryResult={noteUseQueryResult}
                overlayContent={<p className="mt-1">Loading notes is taking a little longer...</p>}
            />

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
                        disabled={!noteEntities.length}
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
    isSearchingNotes: false,
    setIsSearchingNotes: (isSearching: boolean) => {},

    getNoteByNoteEntity: (noteEntity: NoteEntity) => {return <></>}
})