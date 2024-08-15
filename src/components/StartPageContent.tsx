import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../assets/styles/StartPageContent.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import BlockContainer from "./block/BlockContainer";
import SearchBar from "./helpers/SearchBar";
import { getRandomString, isArrayFalsy, log } from "../helpers/utils";
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

    const [blockContainers, setBlockContainers] = useState<JSX.Element[]>();

    const searchInputRef = useRef(null);

    const context = {
        updateBlockContainers
    }


    useEffect(() => {
        $(window).on("keydown", handleKeyDown);

        updateBlockContainers();

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


    function updateBlockContainers(): void {

        setBlockContainers(mapNotesToJsx())
    }


    function mapNotesToJsx(): JSX.Element[] {

        // case: null
        if (!appUser.notes)
            return [];

        return appUser.notes.map((note, i) => 
            <BlockContainer note={note} noteIndex={i} key={getRandomString()} />);
    }


    function addBlockContainer(): void {

        if (isArrayFalsy(appUser.notes))
            appUser.notes = [];

        const newNote = new Note();
        newNote.title = "";

        appUser.notes! = [newNote, ...appUser.notes!];

        updateBlockContainers();
    }

    
    return (
        <StartPageContentContext.Provider value={context}>

            <div 
                id={id} 
                className={className + " fullWidth"}
                style={style}
                {...otherProps}
            >
                <Flex className="mb-5 mt-3" flexWrap="nowrap" verticalAlign="center">
                    {/* SearchBar */}
                    <SearchBar 
                        className="fullWidth me-4" 
                        placeHolder="Search for note Title, note Tag or note Text" 
                        title="Search notes (Ctrl+Shift+F)"
                        ref={searchInputRef}
                        _focus={{borderColor: "var(--accentColor)"}}
                    />

                    {/* New Note Button */}
                    <Button 
                        className="addBlockContainerButton hover" 
                        title="New note" 
                        onClick={addBlockContainer}
                    >
                        <i className="fa-solid fa-plus me-1"></i>
                        <span>New Note</span>
                    </Button>
                </Flex>

                {/* BlockContainers */}
                {blockContainers}

                {children}
            </div>
        </StartPageContentContext.Provider>
    )
}


export const StartPageContentContext = createContext({
    updateBlockContainers: () => {}
})