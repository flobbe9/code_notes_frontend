import $ from "jquery";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import "../assets/styles/StartPageContent.scss";
import { SearchNoteHelper } from "../helpers/SearchNoteHelper";
import { getRandomString } from "../helpers/utils";
import { useCsrfToken } from "../hooks/useCsrfToken";
import AddNewNoteButton from "./AddNewNoteButton";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Flex from "./helpers/Flex";
import PendingFetchHelper from "./helpers/PendingFetchHelper";
import SearchBar from "./helpers/SearchBar";
import Note from "./noteInput/Note";
import { StartPageContainerContext } from "./StartPageContainer";
import Button from "./helpers/Button";
import SaveAllNotesButton from "./SaveAllNotesButton";


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
    
    const { isKeyPressed } = useContext(AppContext);
    const { noteEntities, isFetchNoteEntitiesTakingLonger, noteUseQueryResult } = useContext(AppFetchContext);
    const { selectedTagEntityNames, editedNoteIds } = useContext(StartPageContainerContext);
    const searchNoteHelper = new SearchNoteHelper(noteEntities, selectedTagEntityNames);
    
    const searchInputRef = useRef(null);

    const context = {
        notes,
        setNotes,

        noteSearchResults,

        getNoteByNoteEntity
    }


    useCsrfToken();


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
        return <Note noteEntity={noteEntity} key={key} propsKey={String(key)} />
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
                <Flex className="mt-3" flexWrap="nowrap" verticalAlign="center">
                    <SearchBar 
                        id="StartPage"
                        className="fullWidth" 
                        placeHolder="Search for note Title or Tag" 
                        title="Search notes (Ctrl+Shift+F)"
                        ref={searchInputRef}
                        disabled={!noteEntities.length}
                        onChange={handleSearchValueChange}
                        onKeyDown={handleSearchKeyDown}
                        onXIconClick={handleSearchXIconClick}
                        _focus={{borderColor: "var(--accentColor)"}}
                        _searchIcon={{color: "var(--matteBlackLight)"}}
                    />
                </Flex>

                <Flex className="mt-2 mb-5" horizontalAlign="right">
                    <SaveAllNotesButton disabled={!editedNoteIds.size} rendered={noteEntities.length > 1} />
                    <AddNewNoteButton className={(notes.length ? "" : "hover") + ` ms-4`} />
                </Flex>

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

    getNoteByNoteEntity: (noteEntity: NoteEntity, index: number) => {return <></>}
})