import React, { useContext } from "react";
import "../../assets/styles/AddNewNoteInput.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import { log } from "../../helpers/utils";
import ButtonWithSlideLabel from "../helpers/ButtonWithSlideLabel";
import { NoteContext } from "./Note";
import { NoteInputEntity } from "../../abstract/entites/NoteInputEntity";
import { NoteInputType } from "../../abstract/NoteInputType";
import { CODE_BLOCK_DEFAULT_LANGUAGE, CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE, getDefaultVariableInput, VARIABLE_INPUT_DEFAULT_PLACEHOLDER } from "../../helpers/constants";


interface Props extends DefaultProps {

}


/**
 * Container component with buttons that add a new noteInput to a noteInput container.
 * 
 * @since 0.0.1
 */
export default function AddNewNoteInput({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteInput");

    const { note, noteInputs, setNoteInputs, numNoteInputsParsing, getNoteInputByNoteInputType } = useContext(NoteContext);


    function handleAddPlainTextNoteInput(event): void {
         
        // case: not noteInputs yet
        if (!note.noteInputEntitys)
            note.noteInputEntitys = [];
 
        const newPlainTextNoteInput: NoteInputEntity = {
            value: "Plain text and some <code>code...</code>",
            type: NoteInputType.PLAIN_TEXT
        }

        appendNoteInputEntity(newPlainTextNoteInput);
    }


    function handleAddCodeNoteInputWithVariables(event): void {

        // case: not noteInputs yet
        if (!note.noteInputEntitys)
            note.noteInputEntitys = [];
 
        const newCodeNoteInputWithVariables: NoteInputEntity = {
            // TODO: make this a constant
            value: "Some code and a variable x = " + getDefaultVariableInput() + ". Click the 3 dots on the right to change the programming language.",
            type: NoteInputType.CODE_WITH_VARIABLES,
            programmingLanguage: CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE
        }

        appendNoteInputEntity(newCodeNoteInputWithVariables);
    }

 
    function handleAddCodeNoteInput(event): void {

        // case: not noteInputs yet
        if (!note.noteInputEntitys)
            note.noteInputEntitys = [];
 
        const newCodeNoteInput: NoteInputEntity = {
            value: "",
            type: NoteInputType.CODE,
            programmingLanguage: CODE_BLOCK_DEFAULT_LANGUAGE
        }

        appendNoteInputEntity(newCodeNoteInput);        
    }


    /**
     * Appends a new ```noteInputEntity``` and given ```noteInputEntityEntity``` to their corresponding states.
     * 
     * @param noteInputEntityEntity to add
     */
    function appendNoteInputEntity(noteInputEntityEntity: NoteInputEntity): void {

        if (!note.noteInputEntitys)
            return;
    
        // update app user
        note.noteInputEntitys = [...note.noteInputEntitys, noteInputEntityEntity];

        // update noteInputEntitys
        let newNoteInputEntitys = noteInputs;
        const newNoteInputEntity = getNoteInputByNoteInputType(noteInputEntityEntity);
        newNoteInputEntitys = [...newNoteInputEntitys, newNoteInputEntity];
        setNoteInputs(newNoteInputEntitys);
    }
 

    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            flexWrap="nowrap"
            {...otherProps}
        >
            <div className="col-4 pe-2">
                <ButtonWithSlideLabel 
                    className="fullWidth addPlainTextNoteInputButton" 
                    label="Plain Text" 
                    title="Add plain text section"
                    disabled={numNoteInputsParsing > 0}
                    onClick={handleAddPlainTextNoteInput}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-align-left"></i>
                </ButtonWithSlideLabel>
            </div>

            <div className="col-4 pe-2">
                <ButtonWithSlideLabel 
                    className="fullWidth addCodeNoteInputButton" 
                    label="Code" 
                    title="Add code section"
                    disabled={numNoteInputsParsing > 0}
                    onClick={handleAddCodeNoteInput}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-code"></i>
                </ButtonWithSlideLabel>
            </div>

            <div className="col-4">
                <ButtonWithSlideLabel 
                    className="fullWidth addCodeNoteInputWithVariablesButton" 
                    label="Code with Variables" 
                    title="Add code with variables section"
                    disabled={numNoteInputsParsing > 0}
                    onClick={handleAddCodeNoteInputWithVariables}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-dollar-sign"></i>
                    <span className="curlyBraces">&#123;&#125;</span> 
                </ButtonWithSlideLabel>
            </div>
                
            {children}
        </Flex>
    )
}