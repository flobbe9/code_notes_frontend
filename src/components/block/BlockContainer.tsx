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
import { Note } from "../../abstract/entites/NoteEntity";
import { NoteInputEntityType } from "../../abstract/NoteInputEntityType";
import { getJsxElementIndexByKey, getRandomString, log } from './../../helpers/utils';
import { NoteInputEntity } from "../../abstract/entites/NoteInputEntity";
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

    const { toast, appUserEntity } = useContext(AppContext);
    const { blockContainers, setBlockContainers } = useContext(StartPageContentContext);

    const componentRef = useRef(null);
    const saveButtonRef = useRef(null);

    const context = {
        note,

        numBlocksParsing, 
        setNumBlocksParsing,

        blocks, 
        setBlocks,

        getBlockByNoteInputEntityType
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

        if (!note.noteInputEntitys)
            return [];

        return note.noteInputEntitys.map((noteInputEntity, i) =>
            getBlockByNoteInputEntityType(noteInputEntity));
    }


    function getBlockByNoteInputEntityType(noteInputEntity: NoteInputEntity): JSX.Element {

        const key = getRandomString();
        switch (noteInputEntity.type) {
            case NoteInputEntityType.PLAIN_TEXT:
                return (
                    <DefaultBlock noteInputEntity={noteInputEntity} propsKey={key} key={key}>
                        <PlainTextBlock noteInputEntity={noteInputEntity} />
                    </DefaultBlock>
                    )

            case NoteInputEntityType.CODE:
                return (
                    <DefaultCodeBlock noteInputEntity={noteInputEntity} propsKey={key} key={key}>
                        <CodeBlock noteInputEntity={noteInputEntity} />
                    </DefaultCodeBlock>
                )

            case NoteInputEntityType.CODE_WITH_VARIABLES:
                return (
                    <DefaultCodeBlock noteInputEntity={noteInputEntity} propsKey={key} key={key}>
                        <CodeBlockWithVariables noteInputEntity={noteInputEntity} />
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
            // not more than 50_000 chars in noteinput
            // not more than 255 chars in tag inputs
        
        return new Promise((res, rej) => {
            setTimeout(() => {
                toast("Save", "Successfully saved " + note.title, "success", 5000);
                log(note);
                log(appUserEntity)
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

        // update appUserEntity
        appUserEntity.notes?.splice(noteIndex, 1);

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
    getBlockByNoteInputEntityType: (noteInputEntity: NoteInputEntity) => {return <></>}
})