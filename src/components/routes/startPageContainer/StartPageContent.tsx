import React, { ChangeEvent, createContext, useContext, useEffect, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { NoteEntity } from "../../../abstract/entites/NoteEntity";
import "../../../assets/styles/StartPageContent.scss";
import { getRandomString, isBlank } from "../../../helpers/utils";
import { useCsrfToken } from "../../../hooks/useCsrfToken";
import AddNewNoteButton from "../../AddNewNoteButton";
import { AppContext } from "../../App";
import { AppFetchContext } from "../../AppFetchContextProvider";
import Confirm from "../../helpers/Confirm";
import Flex from "../../helpers/Flex";
import PendingFetchHelper from "../../helpers/PendingFetchHelper";
import SearchBar from "../../helpers/SearchBar";
import Note from "./noteInput/Note";
import PaginationBar from "./PaginationBar";
import SaveAllNotesButton from "./SaveAllNotesButton";


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
    
    /** Make sure that ```notes``` and ```notesUseQueryResult.data``` are ordered the same at all times! */
    const [notes, setNotes] = useState<JSX.Element[]>([]);
    const [isFocusFirstNote, setIsFocusFirstNote] = useState(false);

    const { isKeyPressed, showPopup } = useContext(AppContext);
    const { 
        editedNoteEntities,
        setEditedNoteEntities,
        isFetchNoteEntitiesTakingLonger, 
        notesUseQueryResult, 
        totalNotePages,
        getCurrentNotesPage, 
        setCurrentNotesPage,
        isLoggedIn,
        getNoteSearchPhrase,
        setNoteSearchPhrase
    } = useContext(AppFetchContext);
    
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
        searchInputRef.current!.value = getNoteSearchPhrase();

        window.addEventListener("keydown",  handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);

    useEffect(() => {
        setIsFocusFirstNote(false);
    }, [notesUseQueryResult.data, editedNoteEntities]);

    useEffect(() => {
        if (isLoggedIn)
            setNotes(mapNoteEntitiesToJsx(notesUseQueryResult.data.results));
    }, [notesUseQueryResult.data]);

    useEffect(() => {
        if (!isLoggedIn)
            setNotes(mapNoteEntitiesToJsx(editedNoteEntities));
    }, [editedNoteEntities]);

    useEffect(() => {
        if (!notes?.length && isLoggedIn)
            handleNotePageEmpty();
    }, [notes]);

    /**
     * Should be called if all notes on a page have been deleted. Make sure to display some notes if possible.
     */
    function handleNotePageEmpty(): void {
        const currentNotesPage = getCurrentNotesPage();
        if (currentNotesPage !== 1)
            setCurrentNotesPage(currentNotesPage - 1);
    }

    function handleKeyDown(event: KeyboardEvent): void {
        // focus search input
        if (isKeyPressed("Control") && isKeyPressed("Shift") && event.key === "F") {
            event.preventDefault();
            searchInputRef.current!.focus();
        } 
    }

    function mapNoteEntitiesToJsx(noteEntities: NoteEntity[]): JSX.Element[] {
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
            notesUseQueryResult.refetch();
    }

    function handleSearchValueChange(event: ChangeEvent): void {
        const currentSearchValue = (event.target as HTMLInputElement).value;

        setNoteSearchPhrase(currentSearchValue);
    }

    function handleSearchXIconClick(): void {
        setNoteSearchPhrase("");
    }

    /**
     * Updates the ```currentPage``` state confirming user's choice if there are unsaved changes.
     * 
     * @param page the new ```currentPage```
     */
    function handleNotePageChangeClick(page: number): void {

        const handle = () => {
            setCurrentNotesPage(page);
            setEditedNoteEntities([]);
        }

        // case: has pending changes
        if (editedNoteEntities.length) {
            showPopup(
                <Confirm
                    heading={<h2>Discard unsaved changes?</h2>}
                    message={"You have some unsaved notes. Your changes will be lost if you continue."}
                    rememberMyChoice
                    rememberMyChoiceLabel="Don't ask again"
                    rememberMyChoiceKey="discardChangesChangeNotePage"
                    onConfirm={handle}
                />
            );

        } else 
            handle();
    }

    return (
        <StartPageContentContext.Provider value={context}>
            <PendingFetchHelper 
                isFetchTakingLong={isFetchNoteEntitiesTakingLonger} 
                useQueryResult={notesUseQueryResult}
                overlayContent={<p className="mt-1">Loading notes is taking a little longer...</p>}
            />

            <div 
                id={id} 
                className={className + " fullWidth"}
                style={style}
                ref={componentRef}
                {...otherProps}
            >
                <Flex className="mb-4" flexWrap="nowrap" verticalAlign="center">
                    <SearchBar 
                        id="StartPage"
                        className="fullWidth" 
                        placeHolder="Search notes..." 
                        title="Search notes (Ctrl + Shift + F)"
                        ref={searchInputRef}
                        disabled={!notesUseQueryResult.data.results.length}
                        onChange={handleSearchValueChange}
                        onKeyDown={handleSearchKeyDown}
                        onXIconClick={handleSearchXIconClick}
                        _focus={{borderColor: "var(--accentColor)"}}
                        _searchIcon={{color: "var(--matteBlackLighter)"}}
                    />
                </Flex>

                <Flex className="mb-4" horizontalAlign="right">
                    <SaveAllNotesButton className="mt-2" disabled={!editedNoteEntities.length && isLoggedIn} rendered={notesUseQueryResult.data.results.length > 1} />
                    <AddNewNoteButton className={(notes.length ? "" : "hover") + ` ms-2 mt-2`} />
                </Flex>

                {notes}

                {/* No search results... */}
                <h2 
                    className="textCenter"
                    hidden={!notesUseQueryResult.data.results.length || !!notesUseQueryResult.data.results.length}
                >
                    No search results{!isBlank(getNoteSearchPhrase()) && ` for '${getNoteSearchPhrase()}'`}...
                </h2>

                <PaginationBar 
                    className={`${componentName}-PaginationBar mb-1`} 
                    totalPages={totalNotePages} 
                    getCurrentPage={getCurrentNotesPage} 
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