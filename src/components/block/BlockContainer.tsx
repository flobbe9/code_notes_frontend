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
import { getJsxElementIndexByKey, getRandomString, log } from './../../helpers/utils';
import { NoteInput } from "../../abstract/entites/NoteInput";
import { AppContext } from "../App";
import { StartPageContentContext } from "../StartPageContent";


interface Props extends DefaultProps {

    note: Note,

    propsKey: string
}


/**
 * Container containing a list of different ```Block``` components.
 * @since 0.0.1
 */
// TODO: 
    // confirm leave if not saved
export default function BlockContainer({note, propsKey, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "BlockContainer");

    const [blocks, setBlocks] = useState<JSX.Element[]>([]);

    const [aboutToSave, setAboutToSave] = useState(false);

    /** 
     * Number of blocks that are currently parsing or highlighting their values. Indicates whether the save() function should wait
     * for block values or not.
     */
    const [numBlocksParsing, setNumBlocksParsing] = useState(0);

    const { toast, appUser } = useContext(AppContext);
    const { blockContainers, setBlockContainers } = useContext(StartPageContentContext);

    const componentRef = useRef(null);
    const saveButtonRef = useRef(null);

    const context = {
        note,

        numBlocksParsing, 
        setNumBlocksParsing,

        blocks, 
        setBlocks,

        getBlockByNoteInputType
    }


    useEffect(() => {
        setBlocks(mapBlocksToJsx());

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
            getBlockByNoteInputType(noteInput));
    }


    function getBlockByNoteInputType(noteInput: NoteInput): JSX.Element {

        const key = getRandomString();
        switch (noteInput.type) {
            case NoteInputType.PLAIN_TEXT:
                return (
                    <DefaultBlock noteInput={noteInput} propsKey={key} key={key}>
                        <PlainTextBlock noteInput={noteInput} />
                    </DefaultBlock>
                    )

            case NoteInputType.CODE:
                return (
                    <DefaultCodeBlock noteInput={noteInput} propsKey={key} key={key}>
                        <CodeBlock noteInput={noteInput} />
                    </DefaultCodeBlock>
                )

            case NoteInputType.CODE_WITH_VARIABLES:
                return (
                    <DefaultCodeBlock noteInput={noteInput} propsKey={key} key={key}>
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

        // TODO: validate
            // not more than 50_000 chars
        
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


    function handleDeleteBlockClick(event): void {

        // TODO: confirm
        deleteBlock();
    }


    function deleteBlock(): void {

        const noteIndex = getJsxElementIndexByKey(blockContainers, propsKey);

        // update appUser
        appUser.notes?.splice(noteIndex, 1);

        // update notes
        const newNotes = blockContainers;
        newNotes.splice(noteIndex, 1);
        setBlockContainers([...newNotes]);
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
                        
                    <AddNewBlock className="mt-2 fullWidth" />
                </div>

                <Flex className="mt-4" horizontalAlign="right">
                    {/* Delete */}
                    <ButtonWithSlideLabel 
                        className="me-4 transition deleteNoteButton" 
                        label="Delete Note"
                        title="Delete note" 
                        onClick={handleDeleteBlockClick}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </ButtonWithSlideLabel>

                    {/* Save */}
                    <ButtonWithSlideLabel 
                        label="Save Note"
                        className="saveNoteButton saveNoteButton" 
                        title="Save note"
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

    blocks: [<></>],
    setBlocks: (blocks: JSX.Element[]) => {},
    getBlockByNoteInputType: (noteInput: NoteInput) => {return <></>}
})