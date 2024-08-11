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


interface Props extends DefaultProps {

    note: Note,
    setNotes: (notes: Note[]) => void
}


/**
 * Container containing a list of different ```Block``` components.
 * @since 0.0.1
 */
// TODO: 
    // confirm leave if not saved
export default function BlockContainer({note, setNotes, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "BlockContainer");

    const [blocks, setBlocks] = useState<JSX.Element[]>();

    const [aboutToSave, setAboutToSave] = useState(false);

    /** 
     * Number of blocks that are currently parsing or highlighting their values. Indicates whether the save() function should wait
     * for block values or not.
     */
    const [numBlocksParsing, setNumBlocksParsing] = useState(0);

    const { toast } = useContext(AppContext);

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
        // case: clicked save but was still parsing
        if (isReadyToSave())
            $(saveButtonRef.current!).trigger("click");

    }, [numBlocksParsing]);


    function mapBlocksToJsx(): JSX.Element[] {

        if (!note.noteInputs)
            return [];

        return note.noteInputs.map(noteInput =>
            getBlockByNoteInputType(noteInput));
    }


    function getBlockByNoteInputType(noteInput: NoteInput): JSX.Element {

        switch (noteInput.type) {
            case NoteInputType.PLAIN_TEXT:
                return (
                    <DefaultBlock noteInput={noteInput} key={getRandomString()}>
                        <PlainTextBlock noteInput={noteInput} />
                    </DefaultBlock>
                    )

            case NoteInputType.CODE:
                return (
                    <DefaultCodeBlock noteInput={noteInput} key={getRandomString()}>
                        <CodeBlock noteInput={noteInput} />
                    </DefaultCodeBlock>
                )

            case NoteInputType.CODE_WITH_VARIABLES:
                return (
                    <DefaultCodeBlock noteInput={noteInput} key={getRandomString()}>
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
        
        // TODO
        return new Promise((res, rej) => {
            setTimeout(() => {
                toast("Save", "Successfully saved " + note.title, "success", 5000);
                log(note);
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

                    <AddNewBlock className="mt-4" />
                </div>
                    
                <Flex className="footer mt-1 me-2" horizontalAlign="right">
                    {/* Delete */}
                    <ButtonWithSlideLabel 
                        className="me-2 hover transition" 
                        label="Delete Note"
                        title="Delete note" 
                        style={{backgroundColor: "rgb(248, 141, 141)"}}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </ButtonWithSlideLabel>

                    {/* Save */}
                    {
                        // TODO: disable while not changed
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