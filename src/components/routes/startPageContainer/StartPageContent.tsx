import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { NoteEntity } from "../../../abstract/entites/NoteEntity";
import "../../../assets/styles/StartPageContent.scss";
import { SearchNoteHelper } from "../../../helpers/SearchNoteHelper";
import { getRandomString } from "../../../helpers/utils";
import { useCsrfToken } from "../../../hooks/useCsrfToken";
import AddNewNoteButton from "../../AddNewNoteButton";
import { AppContext } from "../../App";
import { AppFetchContext } from "../../AppFetchContextHolder";
import Flex from "../../helpers/Flex";
import PendingFetchHelper from "../../helpers/PendingFetchHelper";
import SearchBar from "../../helpers/SearchBar";
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
    
    const { isKeyPressed, editedNoteIds } = useContext(AppContext);
    const { noteEntities, isFetchNoteEntitiesTakingLonger, noteUseQueryResult, gotNewNoteEntities } = useContext(AppFetchContext);
    const { selectedTagEntityNames } = useContext(StartPageContainerContext);
    const searchNoteHelper = new SearchNoteHelper(noteEntities, selectedTagEntityNames);
    
    const searchInputRef = useRef<HTMLInputElement>(null);

    const context = {
        notes,
        setNotes,

        noteSearchResults,

        createNoteByNoteEntity
    }


    useCsrfToken();


    useEffect(() => {
        window.addEventListener("keydown",  handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);


    useEffect(() => {
        setNotes(mapNoteEntitiesToJsx());

    }, [gotNewNoteEntities]);


    useEffect(() => {
        handleSearch();

    }, [selectedTagEntityNames]);


    function handleKeyDown(event): void {

        // focus search input
        if (isKeyPressed("Control") && isKeyPressed("Shift") && event.key === "F") {
            event.preventDefault();
            searchInputRef.current!.focus();
        } 
    }


    function mapNoteEntitiesToJsx(): JSX.Element[] {

        if (!noteEntities || !noteEntities.length)
            return [];

        // const notes: JSX.Element[] = [];
        // noteEntities
        //     .forEach((noteEntity, i) => {
        //         if (i >= 5)
        //             return;
        //         notes.push(createNoteByNoteEntity(noteEntity));
        //     })

        // return notes;
        return noteEntities.map(noteEntity => 
            createNoteByNoteEntity(noteEntity));
    }


    function createNoteByNoteEntity(noteEntity: NoteEntity, focusOnRender = false): JSX.Element {

        const key = noteEntity.id ?? getRandomString();
        return <Note key={key} propsKey={String(key)} focusOnRender={focusOnRender} /> 
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
                <Flex className="mt-2 mb-4" flexWrap="nowrap" verticalAlign="center">
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

                <Flex className="mt-2 mb-4" horizontalAlign="right">
                    <SaveAllNotesButton className="mb-2" disabled={!editedNoteIds.size} rendered={noteEntities.length > 1} />
                    <AddNewNoteButton className={(notes.length ? "" : "hover") + ` ms-2`} />
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

    createNoteByNoteEntity: (noteEntity: NoteEntity, focusOnRender = false) => {return <></>}
})