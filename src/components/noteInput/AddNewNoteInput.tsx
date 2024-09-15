import $ from "jquery";
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
import { StartPageContentContext } from "../StartPageContent";
import { AppContext } from "../App";
import { StartPageContainerContext } from "../StartPageContainer";


interface Props extends DefaultProps {

}


/**
 * Container component with buttons that add a new noteInput to a noteInput container.
 * 
 * @since 0.0.1
 */
export default function AddNewNoteInput({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteInput");

    const { appUserEntity } = useContext(AppContext);

    const { noteEntity, noteInputs, setNoteInputs, numNoteInputsParsing, getNoteInputByNoteInputType } = useContext(NoteContext);


    function handleAddPlainTextNoteInput(event): void {
         
        // case: not noteInputs yet
        if (!noteEntity.noteInputs)
            noteEntity.noteInputs = [];

        appendNoteInputEntity(getNewNoteInputEntityPlainText());
    }


    function handleAddCodeNoteInputWithVariables(event): void {

        // case: not noteInputs yet
        if (!noteEntity.noteInputs)
            noteEntity.noteInputs = [];
 
        appendNoteInputEntity(getNewNoteInputEntityWithVariables());
    }

    
    function getNewNoteInputEntityPlainText(): NoteInputEntity {

        let value = "";

        // case: is first note and first noteInput with variables
        if ((appUserEntity.notes || []).length === 1 && !hasNoteEntityNoteInputOfType(NoteInputType.PLAIN_TEXT))
            // add tutorial text
            value = "Plain text and some <code>code...</code>";

        return {
            value: value,
            type: NoteInputType.PLAIN_TEXT
        }
    }


    function getNewNoteInputEntityWithVariables(): NoteInputEntity {

        let value = "";

        // case: is first note and first noteInput with variables
        if ((appUserEntity.notes || []).length === 1 && !hasNoteEntityNoteInputOfType(NoteInputType.CODE_WITH_VARIABLES))
            // add tutorial text
            value = "Some code and a variable x = " + getDefaultVariableInput() + ". Change the programming language on the right.";

        return {
            value: value,
            type: NoteInputType.CODE_WITH_VARIABLES,
            programmingLanguage: CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE
        }
    }


    /**
     * @param noteInputType note input type to look for
     * @returns ```true``` if this ```noteEntity``` has at least one noteInput with given type
     */
    function hasNoteEntityNoteInputOfType(noteInputType: NoteInputType): boolean {

        return !!noteEntity.noteInputs?.find(noteInputEntity => 
            noteInputEntity.type === noteInputType);
    }

 
    function handleAddCodeNoteInput(event): void {

        // case: not noteInputs yet
        if (!noteEntity.noteInputs)
            noteEntity.noteInputs = [];
 
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

        if (!noteEntity.noteInputs)
            return;
    
        // update app user
        noteEntity.noteInputs = [...noteEntity.noteInputs, noteInputEntityEntity];

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