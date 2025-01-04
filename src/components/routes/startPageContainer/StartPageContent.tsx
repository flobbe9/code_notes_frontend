import React, { ChangeEvent, createContext, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { NoteEntity } from "../../../abstract/entites/NoteEntity";
import "../../../assets/styles/StartPageContent.scss";
import { NUM_NOTES_PER_PAGE } from "../../../helpers/constants";
import { SearchNoteHelper } from "../../../helpers/SearchNoteHelper";
import { getRandomString, isBlank } from "../../../helpers/utils";
import { useCsrfToken } from "../../../hooks/useCsrfToken";
import AddNewNoteButton from "../../AddNewNoteButton";
import { AppContext } from "../../App";
import { AppFetchContext } from "../../AppFetchContextHolder";
import Confirm from "../../helpers/Confirm";
import Flex from "../../helpers/Flex";
import PendingFetchHelper from "../../helpers/PendingFetchHelper";
import SearchBar from "../../helpers/SearchBar";
import Note from "./noteInput/Note";
import PaginationBar from "./PaginationBar";
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

    const componentName = "StartPageContent";
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, componentName, true);
    
    /** Make sure that ```notes``` and ```noteEntities``` are ordered the same at all times! */
    const [notes, setNotes] = useState<JSX.Element[]>([]);
    const [isFocusFirstNote, setIsFocusFirstNote] = useState(false);

    const { isKeyPressed, editedNoteIds, showPopup, toast } = useContext(AppContext);
    const { 
        noteEntities, 
        isFetchNoteEntitiesTakingLonger, 
        noteUseQueryResult, 
        gotNewNoteEntities, 
        currentNotesPage, 
        setCurrentNotesPage,
        noteSearchResults,
        setNoteSearchResults,
        isLoggedIn
    } = useContext(AppFetchContext);
    const { selectedTagEntityNames, noteSearchValue, setNoteSearchValue } = useContext(StartPageContainerContext);
    const searchNoteHelper = new SearchNoteHelper(noteUseQueryResult.data, selectedTagEntityNames);
    
    const componentRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const context = {
        notes,
        setNotes,

        setIsFocusFirstNote,

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
        setIsFocusFirstNote(false);

    }, [gotNewNoteEntities]);


    useEffect(() => {
        handleSearch();

    }, [selectedTagEntityNames, noteUseQueryResult.data]);


    useEffect(() => {
        // case: no notes on this page but more in cache
        if (notes && !notes.length && noteUseQueryResult.data.length)
            handleNotePageEmpty();

    }, [notes]);


    /**
     * Should be called if all notes on a page have been deleted. Make sure to display some notes if possible, 
     * either by changing the page or refetching notes.
     */
    function handleNotePageEmpty(): void {

        const lastPage = Math.ceil(noteUseQueryResult.data.length / NUM_NOTES_PER_PAGE);

        // case: not on last page
        if (currentNotesPage < lastPage)
            noteUseQueryResult.refetch();

        // case: currently on last page and got more pages in front
        else if (lastPage !== 1)
            setCurrentNotesPage(currentNotesPage - 1);
    }


    function handleKeyDown(event: KeyboardEvent): void {

        // focus search input
        if (isKeyPressed("Control") && isKeyPressed("Shift") && event.key === "F") {
            event.preventDefault();
            searchInputRef.current!.focus();
        } 
    }


    function mapNoteEntitiesToJsx(): JSX.Element[] {

        if (!noteEntities || !noteEntities.length)
            return [];

        return noteEntities.map((noteEntity, i) => 
            createNoteByNoteEntity(noteEntity, i === 0 && isFocusFirstNote));
    }


    function createNoteByNoteEntity(noteEntity: NoteEntity, focusOnRender = false): JSX.Element {

        const key = noteEntity.id ?? getRandomString();
        return <Note key={key} propsKey={String(key)} focusOnRender={focusOnRender} /> 
    }


    function handleSearchKeyDown(event: React.KeyboardEvent): void {

        if (event.key === "Enter")
            handleSearch((event.target as HTMLInputElement).value)
    }
    

    function handleSearchValueChange(event: ChangeEvent): void {

        const currentSearchValue = (event.target as HTMLInputElement).value;

        handleSearch(currentSearchValue);

        setNoteSearchValue(currentSearchValue);
    }


    function handleSearchXIconClick(): void {

        handleSearch("");
    }


    /**
     * Update the ```searchResults``` state with matching note entities and go to page 1.
     * 
     * @param searchValue the search bar input. Default is ```noteSearchValue```
     */
    function handleSearch(searchValue = noteSearchValue): void {

        // if edited notes
        if (editedNoteIds.size && isLoggedIn) {
            toast("Cannot search", "Please save your pending changes first.", "warn");
            return;
        }
        
        // case: no search query
        if (isBlank(searchValue) && !selectedTagEntityNames.size)
            setNoteSearchResults(undefined);

        else {
            const searchResults = searchNoteHelper.getNoteSearchResults(searchValue);
            setNoteSearchResults(searchResults);

            if (currentNotesPage > getTotalPages())
                setCurrentNotesPage(1);
        }
    }


    /**
     * Updates the ```currentPage``` state confirming user's choice if there are unsaved changes.
     * 
     * @param page the new ```currentPage```
     */
    function handleNotePageChangeClick(page: number): void {

        // case: has pending changes
        if (editedNoteIds.size) {
            showPopup(
                <Confirm
                    heading={<h2>Discard unsaved changes?</h2>}
                    message={"You have some unsaved notes. Your changes will be lost if you continue."}
                    rememberMyChoice
                    rememberMyChoiceLabel="Don't ask again"
                    rememberMyChoiceKey="discardChangesChangeNotePage"
                    onConfirm={() => setCurrentNotesPage(page)}
                />
            );

        } else 
            setCurrentNotesPage(page);
    }


    function getTotalPages(): number {

        return Math.ceil((noteSearchResults ? noteSearchResults : noteUseQueryResult.data).length / NUM_NOTES_PER_PAGE);
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
                ref={componentRef}
                {...otherProps}
            >
                <Flex className="mt-2 mb-4" flexWrap="nowrap" verticalAlign="center">
                    <SearchBar 
                        id="StartPage"
                        className="fullWidth" 
                        placeHolder="Search for note title or tag" 
                        title="Search notes (Ctrl + Shift + F)"
                        ref={searchInputRef}
                        disabled={!noteUseQueryResult.data.length}
                        onChange={handleSearchValueChange}
                        onKeyDown={handleSearchKeyDown}
                        onXIconClick={handleSearchXIconClick}
                        _focus={{borderColor: "var(--accentColor)"}}
                        _searchIcon={{color: "var(--matteBlackLighter)"}}
                    />
                </Flex>

                <Flex className="mt-2 mb-4" horizontalAlign="right">
                    <SaveAllNotesButton className="mb-2" disabled={!editedNoteIds.size && isLoggedIn} rendered={noteEntities.length > 1} />
                    <AddNewNoteButton className={(notes.length ? "" : "hover") + ` ms-2`} />
                </Flex>

                {notes}

                {/* No search results... */}
                <h2 
                    className="textCenter"
                    hidden={!noteUseQueryResult.data.length || !!noteEntities.length}
                >
                    No search results{!isBlank(noteSearchValue) && ` for '${noteSearchValue}'`}...
                </h2>

                <PaginationBar 
                    className={`${componentName}-PaginationBar mb-1`} 
                    totalPages={getTotalPages()} 
                    currentPage={currentNotesPage} 
                    setCurrentPage={handleNotePageChangeClick}
                />

                {children}
            </div>
        </StartPageContentContext.Provider>
    )
}


export const StartPageContentContext = createContext({
    notes: [<></>],
    setNotes: (notes: JSX.Element[]) => {},

    setIsFocusFirstNote: (focus: boolean) => {},

    createNoteByNoteEntity: (noteEntity: NoteEntity, focusOnRender = false) => {return <></>}
})