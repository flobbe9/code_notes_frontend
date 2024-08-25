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
import { MAX_NOTE_TITLE_VALUE_LENGTH, MAX_TAG_INPUT_VALUE_LENGTH } from "../../helpers/constants";
import { TagEntityService } from './../../abstract/services/TagEntityService';
import { NoteInputEntityService } from "../../abstract/services/NoteInputEntityService";
import { NoteEntityService } from './../../abstract/services/NoteEntityService';
import Confirm from "../helpers/Confirm";


interface Props extends DefaultProps {

    noteEntity: NoteEntity,

    propsKey: string
}


/**
 * Container containing a list of different ```NoteInput``` components.
 * 
 * @parent ```<StartPageContent>```
 * @since 0.0.1
 */
// TODO: 
    // confirm leave if not saved
export default function Note({noteEntity, propsKey, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Note");

    const [noteInputs, setNoteInputs] = useState<JSX.Element[]>([]);

    const [aboutToSave, setAboutToSave] = useState(false);

    const { setIsPopupVisible, setPopupContent } = useContext(AppContext);

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
        noteEntity,

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

        if (!noteEntity.noteInputs)
            return [];

        return noteEntity.noteInputs.map((noteInputEntity, i) =>
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

        // case: invalid input
        if (!isNoteValid())
            return;

        return new Promise((res, rej) => {
            setTimeout(() => {
                toast("Save", "Successfully saved note", "success", 5000);
                log(noteEntity);
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


    function handleDeleteNoteClick(event): void {

        setPopupContent(
            <Confirm
                heading={<h3>Delete Note?</h3>}
                message={`Are you sure you want to delete '${noteEntity.title}'?`}
                onConfirm={event => {deleteNote(); setIsPopupVisible(false)}}
                onCancel={event => setIsPopupVisible(false)}
                style={{maxWidth: "50vw"}}
            />
        );

        setIsPopupVisible(true);
    }


    function deleteNote(): void {

        const noteIndex = getJsxElementIndexByKey(notes, propsKey);

        // update appUserEntity
        appUserEntity.notes?.splice(noteIndex, 1);

        // update notes
        const newNotes = notes;
        newNotes.splice(noteIndex, 1);
        setNotes([...newNotes]);

        // TODO: save appuser
    }


    /**
     * Validate and handle invalid note parts.
     * 
     * @returns ```false``` if at least one part of this ```noteEntity``` is invalid
     */
    function isNoteValid(): boolean {

        const noteEntityService = new NoteEntityService(noteEntity);
        const tagEntityService = new TagEntityService(noteEntity.tags);
        const noteInputEntityService = new NoteInputEntityService(noteEntity.noteInputs);

        return noteEntityService.isEntityValid(handleNoteEntityInvalid) &&
               tagEntityService.areEntitiesValid(handleTagEntityInvalid) && 
               noteInputEntityService.areEntitiesValid(handleNoteInputEntityInvalid);
    }


    function handleTagEntityInvalid(i: number): void {

        toast(`Tag ${i + 1} invalid`, `Tags cannot be longer than ${MAX_TAG_INPUT_VALUE_LENGTH} characters.`, "warn");
    }


    function handleNoteInputEntityInvalid(i: number): void {

        toast("Note section invalid", `The content of note section number ${i + 1} is too long. Please shorten it a bit.`, "warn");
    }


    function handleNoteEntityInvalid(): void {

        toast("Note title invalid", `The note title cannot be longer than ${MAX_NOTE_TITLE_VALUE_LENGTH} characters.`, "warn");
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
                        onClick={handleDeleteNoteClick}
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
    noteEntity: new NoteEntity(),

    numNoteInputsParsing: 0, 
    setNumNoteInputsParsing: (num: number) => {},

    noteInputs: [<></>],
    setNoteInputs: (noteInputs: JSX.Element[]) => {},
    getNoteInputByNoteInputType: (noteInputEntity: NoteInputEntity) => {return <></>}
})