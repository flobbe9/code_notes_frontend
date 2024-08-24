import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/Note.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultNoteInput from "./DefaultNoteInput";
import DefaultCodeNoteInput from "./DefaultCodeNoteInput";
import CodeNoteInput from "./CodeNoteInput";
import PlainTextNoteInput from "./PlainTextNoteInput";
import CodeNoteInputWithVariables from "./CodeNoteInputWithVariables";
import NoteTagList from "./NoteTagList";
import Flex from "../helpers/Flex";
import NoteTitle from "./NoteTitle";
import AddNewNoteInput from "./AddNewNoteInput";
import ButtonWithSlideLabel from "../helpers/ButtonWithSlideLabel";
import { NoteEntity } from "../../abstract/entites/NoteEntity";
import { NoteInputType } from "../../abstract/NoteInputType";
import { getJsxElementIndexByKey, getRandomString, log } from '../../helpers/utils';
import { NoteInputEntity } from "../../abstract/entites/NoteInputEntity";
import { AppContext } from "../App";
import { StartPageContentContext } from "../StartPageContent";


interface Props extends DefaultProps {

    note: NoteEntity,

    propsKey: string
}


/**
 * Container containing a list of different ```NoteInput``` components.
 * @since 0.0.1
 */
// TODO: 
    // confirm leave if not saved
export default function Note({note, propsKey, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Note");

    const [noteInputs, setNoteInputs] = useState<JSX.Element[]>([]);

    const [aboutToSave, setAboutToSave] = useState(false);

    /** 
     * Number of noteInputs that are currently parsing or highlighting their values. Indicates whether the save() function should wait
     * for noteInput values or not.
     */
    const [numNoteInputsParsing, setNumNoteInputsParsing] = useState(0);

    const { toast, appUserEntity } = useContext(AppContext);
    const { notes, setNotes } = useContext(StartPageContentContext);

    const componentRef = useRef(null);
    const saveButtonRef = useRef(null);

    const context = {
        note,

        numNoteInputsParsing, 
        setNumNoteInputsParsing,

        noteInputs, 
        setNoteInputs,

        getNoteInputByNoteInputType
    }


    useEffect(() => {
        setNoteInputs(mapNoteInputsToJsx());

    }, []);


    useEffect(() => {
        // case: clicked save and has finished parsing
        if (isReadyToSave())
            $(saveButtonRef.current!).trigger("click");

    }, [numNoteInputsParsing]);


    function mapNoteInputsToJsx(): JSX.Element[] {

        if (!note.noteInputEntitys)
            return [];

        return note.noteInputEntitys.map((noteInputEntity, i) =>
            getNoteInputByNoteInputType(noteInputEntity));
    }


    function getNoteInputByNoteInputType(noteInputEntity: NoteInputEntity): JSX.Element {

        const key = getRandomString();
        switch (noteInputEntity.type) {
            case NoteInputType.PLAIN_TEXT:
                return (
                    <DefaultNoteInput noteInputEntity={noteInputEntity} propsKey={key} key={key}>
                        <PlainTextNoteInput noteInputEntity={noteInputEntity} />
                    </DefaultNoteInput>
                    )

            case NoteInputType.CODE:
                return (
                    <DefaultCodeNoteInput noteInputEntity={noteInputEntity} propsKey={key} key={key}>
                        <CodeNoteInput noteInputEntity={noteInputEntity} />
                    </DefaultCodeNoteInput>
                )

            case NoteInputType.CODE_WITH_VARIABLES:
                return (
                    <DefaultCodeNoteInput noteInputEntity={noteInputEntity} propsKey={key} key={key}>
                        <CodeNoteInputWithVariables noteInputEntity={noteInputEntity} />
                    </DefaultCodeNoteInput>
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

        return aboutToSave && numNoteInputsParsing === 0
    }


    function handleDeleteNoteInputClick(event): void {

        // TODO: confirm
        deleteNoteInput();
    }


    function deleteNoteInput(): void {

        const noteIndex = getJsxElementIndexByKey(notes, propsKey);

        // update appUserEntity
        appUserEntity.notes?.splice(noteIndex, 1);

        // update notes
        const newNotes = notes;
        newNotes.splice(noteIndex, 1);
        setNotes([...newNotes]);
    }
        

    return (
        <NoteContext.Provider value={context}>
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
                        <NoteTitle className="me-1 col-6" />

                        {/* Tags */}
                        <NoteTagList className="col-6" />
                    </Flex>

                    {/* NoteInputs */}
                    {noteInputs}
                        
                    <AddNewNoteInput className="mt-2 fullWidth" />
                </div>

                <Flex className="mt-4" horizontalAlign="right">
                    {/* Delete */}
                    <ButtonWithSlideLabel 
                        className="me-4 transition deleteNoteButton" 
                        label="Delete Note"
                        title="Delete note" 
                        onClick={handleDeleteNoteInputClick}
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
        </NoteContext.Provider>
    )
}


export const NoteContext = createContext({
    note: new NoteEntity(),

    numNoteInputsParsing: 0, 
    setNumNoteInputsParsing: (num: number) => {},

    noteInputs: [<></>],
    setNoteInputs: (noteInputs: JSX.Element[]) => {},
    getNoteInputByNoteInputType: (noteInputEntity: NoteInputEntity) => {return <></>}
})