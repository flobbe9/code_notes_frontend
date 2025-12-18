import React, { ChangeEvent, createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { NoteEntity } from "../../../abstract/entites/NoteEntity";
import { NOTE_SEARCH_PHRASE_MIN_LENGTH, NOTE_SEARCH_PHRASE_USER_INPUT_DELAY } from "../../../helpers/constants";
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

    const location = useLocation();
    
    /** Make sure that ```notes``` and ```notesUseQueryResult.data``` are ordered the same at all times! */
    const [notes, setNotes] = useState<JSX.Element[]>([]);
    const [isFocusFirstNote, setIsFocusFirstNote] = useState(false);

    const [isNoteSearchDisabled, setNoteSearchDisabled] = useState(false);
    const [isAddNewNoteButtonDisabled, setNewNoteButtonDisabled] = useState(false);

    const [noteSearchUserInputTimeout, setNoteSearchUserInputTimeout] = useState<NodeJS.Timeout>();

    const { isKeyPressed, showPopup, toast } = useContext(AppContext);
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
        setNoteSearchPhrase,
        getNoteSearchTags
    } = useContext(AppFetchContext);
    
    const componentRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const saveAllNotesButtonRef = useRef<HTMLButtonElement>(null);
    const newNoteButtonRef = useRef<HTMLButtonElement>(null);

    const context = {
        notes,
        setNotes,
        mapNoteEntitiesToJsx,

        setIsFocusFirstNote,

        createNoteByNoteEntity,

        isSearchingNotes,
        isEditingNotes
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
        setNoteSearchDisabled(isEditingNotes() || hasNoSavedNotes());
        setNewNoteButtonDisabled(isSearchingNotes() || isEditingNotes());
    }, [editedNoteEntities, isLoggedIn, location, notesUseQueryResult.data]);

    useEffect(() => {
        handleLocationChange();
    }, [location]);

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

        // save all notes
        if (isKeyPressed("Control") && isKeyPressed("Shift") && event.key === "S" && getComputedStyle(componentRef.current?.querySelector("#ButtonSaveAllNotesButton")!).getPropertyValue("display") !== "none") {
            // case: no noteinput focused
            if (!document.activeElement?.matches(".DefaultNoteInput .ContentEditableDiv") && !document.activeElement?.matches(".DefaultNoteInput textarea.inputarea")) {
                event.preventDefault();
                saveAllNotesButtonRef.current!.click();

            } else
                toast("Save all", "Remove the focus from this input first.", "info", 7000);
        }

        // new note
        if (isKeyPressed("Control") && isKeyPressed("Alt") && event.key === "n") {
            event.preventDefault();
            newNoteButtonRef.current!.click();
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

    function handleLocationChange(): void {
        let searchPhrase = getNoteSearchPhrase();
        if (isBlank(searchPhrase))
            searchPhrase = "";

        // update searchbar value using url query params
        if (searchInputRef.current)
            searchInputRef.current.value = searchPhrase!;        
    }

    function handleSearchValueChange(event: ChangeEvent): void {
        const noteSearchPhrase = (event.target as HTMLInputElement).value;

        handleNoteSearch(noteSearchPhrase);
    }

    function handleSearchXIconClick(): void {
        handleNoteSearch("");
    }

    /**
     * Update url query params for note search which should trigger a refetch. Delay a bit to wait for user to finish typing.
     * 
     * Don't update url if not enough search chars.
     * 
     * @param searchPhrase to update url with 
     */
    function handleNoteSearch(searchPhrase: string): void {
        // clear timeout whether search will be done or not
        if (noteSearchUserInputTimeout)
            clearTimeout(noteSearchUserInputTimeout);

        // case: not enough search chars
        if (!isBlank(searchPhrase) && searchPhrase.length < NOTE_SEARCH_PHRASE_MIN_LENGTH)
            return;

        // wait for user to finish typing to avoid unnecessary fetch requests
        const timeout = setTimeout(() => {
            setNoteSearchPhrase(searchPhrase);
        }, NOTE_SEARCH_PHRASE_USER_INPUT_DELAY);

        setNoteSearchUserInputTimeout(timeout);
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
    
    /**
     * Indicates that the user is filtering / searching notes.
     * 
     * @returns `true` if either search phrase or search tags are present 
     */
    function isSearchingNotes(): boolean {
        return !isBlank(getNoteSearchPhrase()) || getNoteSearchTags().size > 0;
    }

    /**
     * Indicates that user has at least one unsaved note.
     * 
     * @returns `true` if at least one edited note exists
     */
    function isEditingNotes(): boolean {
        return !!editedNoteEntities.length && isLoggedIn;
    }

    function hasNoSavedNotes(): boolean {
        return (!notesUseQueryResult.data.results.length && !isSearchingNotes()) || !isLoggedIn ;
    }
    
    function getNoteSearchTitle(): string {
        const noNotesMessage = "No saved notes yet...";
        const isEditingMessage = "save your pending changes";

        if (isEditingNotes())
            return `Please ${isEditingMessage} first.`;

        if (hasNoSavedNotes())
            return `${noNotesMessage}`;

        return "Search notes (Ctrl + Shift + F)";
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
                        title={getNoteSearchTitle()}
                        ref={searchInputRef}
                        disabled={isNoteSearchDisabled}
                        onChange={handleSearchValueChange}
                        onXIconClick={handleSearchXIconClick}
                        _focus={{borderColor: "var(--accentColor)"}}
                        _searchIcon={{color: "var(--matteBlackLighter)"}}
                    />
                </Flex>

                <Flex className="mb-4" horizontalAlign="right">
                    <SaveAllNotesButton 
                        className="mt-2" 
                        ref={saveAllNotesButtonRef}
                        disabled={!editedNoteEntities.length && isLoggedIn} 
                        rendered={notesUseQueryResult.data.results.length > 1} 
                    />
                    <AddNewNoteButton 
                        className={(notes.length ? "" : "hover") + ` ms-2 mt-2`} 
                        ref={newNoteButtonRef}
                        disabled={isAddNewNoteButtonDisabled} 
                    />
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
    mapNoteEntitiesToJsx: (noteEntities: NoteEntity[]): JSX.Element[] => [],

    setIsFocusFirstNote: (focus: boolean) => {},

    createNoteByNoteEntity: (noteEntity: NoteEntity, focusOnRender = false) => {return <></>},
    isSearchingNotes: () => false as boolean,
    isEditingNotes: () => false as boolean
})
