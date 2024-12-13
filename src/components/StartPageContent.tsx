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
import SaveAllNotesButton from "./SaveAllNotesButton";
import { StartPageContainerContext } from "./StartPageContainer";


interface Props extends DefaultProps {

}


/**
 * Container for all content on start page that is not the side bar.
 * 
 * @since 0.0.1
 */
export default function StartPageContent({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageContent", true);
    
    /** Make sure that ```notes``` and ```noteEntities``` are ordered the same at all times! */
    const [notes, setNotes] = useState<JSX.Element[]>([]);
    const [noteSearchValue, setNoteSearchValue] = useState("");
    const [noteSearchResults, setNoteSearchResults] = useState<NoteEntity[]>([]);
    
    const { isKeyPressed, hasAnyNoteBeenEdited } = useContext(AppContext);
    const { noteEntities, isFetchNoteEntitiesTakingLonger, noteUseQueryResult } = useContext(AppFetchContext);
    const { selectedTagEntityNames } = useContext(StartPageContainerContext);
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

        // only update the whole state if no notes are rendered yet or notes have been cleared
        if (!notes.length || !noteEntities.length)
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


    function mapNoteEntitiesToJsx(): JSX.Element[] {

        if (!noteEntities || !noteEntities.length)
            return [];

        return noteEntities.map((noteEntity) => 
            getNoteByNoteEntity());
    }


    function getNoteByNoteEntity(): JSX.Element {

        const key = getRandomString();
        return <Note key={key} propsKey={String(key)} />
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
                        placeHolder="Search for note title or tag" 
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
                    <SaveAllNotesButton disabled={!hasAnyNoteBeenEdited} rendered={noteEntities.length > 1} />
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