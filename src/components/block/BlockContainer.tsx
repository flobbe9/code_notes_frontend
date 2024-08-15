import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/BlockContainer.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import DefaultCodeBlock from "./DefaultCodeBlock";
import CodeBlock from "./CodeBlock";
import PlainTextBlock from "./PlainTextBlock";
import CodeBlockWithVariables from "./CodeBlockWithVariables";
import BlockContainerTagList from "./BlockContainerTagList";
import Flex from "../helpers/Flex";
import BlockContainerTitle from "./BlockContainerTitle";
import AddNewBlock from "./AddNewBlock";
import ButtonWithSlideLabel from "../helpers/ButtonWithSlideLabel";
import { Note } from "../../abstract/entites/Note";
import { NoteInputType } from "../../abstract/NoteInputType";
import { getRandomString, log } from './../../helpers/utils';
import { NoteInput } from "../../abstract/entites/NoteInput";
import { AppContext } from "../App";
import { StartPageContentContext } from "../StartPageContent";


interface Props extends DefaultProps {

    note: Note,

    noteIndex: number
}


/**
 * Container containing a list of different ```Block``` components.
 * @since 0.0.1
 */
// TODO: 
    // confirm leave if not saved
export default function BlockContainer({note, noteIndex, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "BlockContainer");

    const [blocks, setBlocks] = useState<JSX.Element[]>();

    const [aboutToSave, setAboutToSave] = useState(false);

    /** 
     * Number of blocks that are currently parsing or highlighting their values. Indicates whether the save() function should wait
     * for block values or not.
     */
    const [numBlocksParsing, setNumBlocksParsing] = useState(0);

    const { toast, appUser } = useContext(AppContext);
    const { updateBlockContainers } = useContext(StartPageContentContext);

    const componentRef = useRef(null);
    const saveButtonRef = useRef(null);

    const context = {
        note,

        numBlocksParsing, 
        setNumBlocksParsing,

        updateBlocks
    }


    useEffect(() => {
        updateBlocks();

    }, []);


    useEffect(() => {
        // case: clicked save and has finished parsing
        if (isReadyToSave())
            $(saveButtonRef.current!).trigger("click");

    }, [numBlocksParsing]);


    function mapBlocksToJsx(): JSX.Element[] {

        if (!note.noteInputs)
            return [];

        return note.noteInputs.map((noteInput, i) =>
            getBlockByNoteInputType(noteInput, i));
    }


    function getBlockByNoteInputType(noteInput: NoteInput, noteInputIndex: number): JSX.Element {

        switch (noteInput.type) {
            case NoteInputType.PLAIN_TEXT:
                return (
                    <DefaultBlock noteInput={noteInput} noteInputIndex={noteInputIndex} key={getRandomString()}>
                        <PlainTextBlock noteInput={noteInput} />
                    </DefaultBlock>
                    )

            case NoteInputType.CODE:
                return (
                    <DefaultCodeBlock noteInput={noteInput} noteInputIndex={noteInputIndex} key={getRandomString()}>
                        <CodeBlock noteInput={noteInput} />
                    </DefaultCodeBlock>
                )

            case NoteInputType.CODE_WITH_VARIABLES:
                return (
                    <DefaultCodeBlock noteInput={noteInput} noteInputIndex={noteInputIndex} key={getRandomString()}>
                        <CodeBlockWithVariables noteInput={noteInput} />
                    </DefaultCodeBlock>
                )

            // should not happen
            default: 
                return <div key={getRandomString()}></div>;
        }
    }


    async function handleSave(event): Promise<void> {

        // case: still parsing
        if (!isReadyToSave()) 
            return;
        
        return new Promise((res, rej) => {
            setTimeout(() => {
                toast("Save", "Successfully saved " + note.title, "success", 5000);
                log(note);
                log(appUser)
                setAboutToSave(false);
                res();
            }, 2000);
        });
    }


    function handleMouseDown(event): void {

        setAboutToSave(true);
    }


    function isReadyToSave(): boolean {

        return aboutToSave && numBlocksParsing === 0
    }


    /**
     * Map ```note.noteInputs``` to jsx elements and update ```blocks``` state.
     */
    function updateBlocks(): void {

        setBlocks(mapBlocksToJsx());
    }


    function deleteBlock(): void {

        // TODO: confirm
        appUser.notes?.splice(noteIndex, 1);

        updateBlockContainers();
    }


    return (
        <BlockContainerContext.Provider value={context}>
            <div 
                id={id} 
                className={className}
                style={style}
                ref={componentRef}
                {...otherProps}
            >
                <div className="contentContainer">
                    <Flex className="fullWidth mb-4" flexWrap="nowrap">
                        {/* Title */}
                        <BlockContainerTitle className="me-1 col-6" />

                        {/* Tags */}
                        <BlockContainerTagList className="col-6" />
                    </Flex>

                    {/* Blocks */}
                    {blocks}
                        
                    <Flex className="footer mt-3 fullWidth" flexWrap="nowrap">
                        {/* TODO: remove margin start from first button */}
                        <AddNewBlock className="me-2 fullWidth" />

                        {/* Delete */}
                        <ButtonWithSlideLabel 
                            className="me-2 hover transition" 
                            label="Delete Note"
                            title="Delete note" 
                            style={{backgroundColor: "rgb(248, 141, 141)"}}
                            onClick={deleteBlock}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </ButtonWithSlideLabel>

                        {/* Save */}
                        {
                            // TODO: 
                                // disable while not changed
                                // button not wide enough for slide label
                        }
                        <ButtonWithSlideLabel 
                            label="Save Note"
                            className="hover saveNoteButton" 
                            title="Save note"
                            style={{backgroundColor: "rgb(141, 141, 248)"}}
                            ref={saveButtonRef}
                            onMouseDown={handleMouseDown}
                            onClickPromise={handleSave}
                        >
                            <i className="fa-solid fa-floppy-disk"></i>
                        </ButtonWithSlideLabel>
                    </Flex>
                </div>

                {children}
            </div>
        </BlockContainerContext.Provider>
    )
}


export const BlockContainerContext = createContext({
    note: new Note(),

    numBlocksParsing: 0, 
    setNumBlocksParsing: (num: number) => {},

    updateBlocks: () => {}
})