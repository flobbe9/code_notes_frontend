import React, { useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/StartPageContent.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import BlockContainer from "./block/BlockContainer";
import SearchBar from "./helpers/SearchBar";
import { getRandomString, log } from "../helpers/utils";
import { AppContext } from "./App";
import Flex from "./helpers/Flex";
import Button from "./helpers/Button";
import { Note } from "../abstract/entites/Note";


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

    const { appUser, isKeyPressed } = useContext(AppContext);

    const [notes, setNotes] = useState<Note[] | null | undefined>(appUser.notes);
    const [blockContainers, setBlockContainers] = useState<JSX.Element[]>();

    const searchInputRef = useRef(null);


    useEffect(() => {
        $(window).on("keydown", handleKeyDown);

        setBlockContainers(mapNotesToJsx());

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


    function mapNotesToJsx(): JSX.Element[] {

        // case: null
        if (!notes)
            return [];

        return notes.map(note => 
            <BlockContainer note={note} key={getRandomString()} />);
    }

    
    return (
        <div 
            id={id} 
            className={className + " fullWidth"}
            style={style}
            {...otherProps}
        >
            <div className="mb-5 mt-3">
                {/* SearchBar */}
                <SearchBar 
                    className="fullWidth" 
                    placeHolder="Search for note Title, note Tag or note Text" 
                    title="Search notes (Ctrl+Shift+F)"
                    ref={searchInputRef}
                    _focus={{borderColor: "var(--accentColor)"}}
                />

                {/* New Note Button */}
                <Button className="addBlockContainerButton hover mt-2 fullWidth" title="New note">
                    <i className="fa-solid fa-plus me-1"></i>
                    <span>New Note</span>
                </Button>
            </div>

            {/* BlockContainers */}
            {blockContainers}

            {children}
        </div>
    )
}