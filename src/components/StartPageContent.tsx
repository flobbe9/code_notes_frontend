import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/StartPageContent.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Note from "./noteInput/Note";
import SearchBar from "./helpers/SearchBar";
import { getRandomString, isArrayFalsy, log } from "../helpers/utils";
import { AppContext } from "./App";
import Flex from "./helpers/Flex";
import Button from "./helpers/Button";
import { NoteEntity } from "../abstract/entites/NoteEntity";
import ButtonWithSlideLabel from "./helpers/ButtonWithSlideLabel";


interface Props extends DefaultProps {

}


/**
 * Container for all content on start page that is not the side bar.
 * 
 * @since 0.0.1
 */
// TODO: 
    // what to display while there's no notes
export default function StartPageContent({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "StartPageContent", true);

    const { appUserEntity, isKeyPressed } = useContext(AppContext);

    const [notes, setNotes] = useState<JSX.Element[]>([]);

    const searchInputRef = useRef(null);

    const context = {
        notes,
        setNotes
    }


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


    function mapNoteEntitiesToJsx(): JSX.Element[] {

        if (!appUserEntity.notes)
            return [];

        return appUserEntity.notes.map(note => 
            getNoteByNoteEntity(note));
    }


    /**
     * Prepend both a new ```note``` and a new ```noteEntity``` to their corresponding states.
     */
    function prependNote(): void {

        if (isArrayFalsy(appUserEntity.notes))
            appUserEntity.notes = [];

        // create new note
        const newNoteEntity = new NoteEntity();
        newNoteEntity.title = "";

        // create new note entity
        const newNote = getNoteByNoteEntity(newNoteEntity);

        // 
        appUserEntity.notes! = [newNoteEntity, ...appUserEntity.notes!];

        let newNotes = notes;
        newNotes = [newNote, ...newNotes];

        setNotes(newNotes);
    }


    function getNoteByNoteEntity(noteEntity: NoteEntity): JSX.Element {

        const key = getRandomString();
        return <Note noteEntity={noteEntity} key={key} propsKey={key} />
    }


    return (
        <StartPageContentContext.Provider value={context}>

            <div 
                id={id} 
                className={className + " fullWidth"}
                style={style}
                {...otherProps}
            >
                <Flex className="mt-3" flexWrap="nowrap" verticalAlign="center">
                    {/* SearchBar */}
                    <SearchBar 
                        id="StartPage"
                        className="fullWidth" 
                        placeHolder="Search for note Title, note Tag or note Text" 
                        title="Search notes (Ctrl+Shift+F)"
                        ref={searchInputRef}
                        _focus={{borderColor: "var(--accentColor)"}}
                        _searchIcon={{color: "var(--vsCodeBlackLight)"}}
                    />
                </Flex>

                <Flex className="mt-2 mb-5" horizontalAlign="right">
                    {/* New Note Button */}
                    <ButtonWithSlideLabel 
                        className="addNoteButton" 
                        label="New note"
                        onClick={prependNote}
                        >
                        <i className="fa-solid fa-plus"></i>
                    </ButtonWithSlideLabel>
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
    setNotes: (notes: JSX.Element[]) => {}
})