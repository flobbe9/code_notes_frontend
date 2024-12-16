import React, { useContext } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { NoteInputEntity } from "../../abstract/entites/NoteInputEntity";
import { NoteInputType } from "../../abstract/NoteInputType";
import "../../assets/styles/AddNewNoteInput.scss";
import { CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE, getDefaultVariableInput } from "../../helpers/constants";
import { AppFetchContext } from "../AppFetchContextHolder";
import ButtonWithSlideLabel from "../helpers/ButtonWithSlideLabel";
import Flex from "../helpers/Flex";
import { NoteContext } from "./Note";


interface Props extends DefaultProps {

}


/**
 * Container component with buttons that add a new noteInput to a noteInput container.
 * 
 * @since 0.0.1
 */
export default function AddNewNoteInput({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteInput");

    const { noteEntities } = useContext(AppFetchContext);
    const { noteEntity, noteInputs, setNoteInputs, createNoteInputByNoteInputType, noteEdited } = useContext(NoteContext);


    function handleAddCodeNoteInput(event): void {
         
        // case: not noteInputs yet
        if (!noteEntity.noteInputs)
            noteEntity.noteInputs = [];

        appendNoteInputEntity(getNewNoteInputEntityCode());
    }


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
        if (noteEntities.length === 1 && !hasNoteEntityNoteInputOfType("PLAIN_TEXT"))
            // add tutorial text
            value = "Plain text and some <code>code...</code>";

        return {
            value: value,
            type: "PLAIN_TEXT"
        }
    }


    function getNewNoteInputEntityWithVariables(): NoteInputEntity {

        let value = "";

        // case: is first note and first noteInput with variables
        if (noteEntities.length === 1 && !hasNoteEntityNoteInputOfType("CODE_WITH_VARIABLES"))
            // add tutorial text
            value = `x = ${getDefaultVariableInput()} can be copied to the clipboard. Change the programming language on the right.`;

        return {
            value: value,
            type: "CODE_WITH_VARIABLES",
            programmingLanguage: CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE
        }
    }

    
    function getNewNoteInputEntityCode(): NoteInputEntity {

        let value = "";

        // case: is first note and first noteInput with variables
        if (noteEntities.length === 1 && !hasNoteEntityNoteInputOfType("CODE"))
            // add tutorial text
            value = "VSCode Editor. Change the programming language on the right.";

        return {
            value: value,
            type: "CODE"
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


    /**
     * Appends a new ```noteInputEntity``` and given ```noteInputEntityEntity``` to their corresponding states.
     * 
     * @param noteInputEntityEntity to add
     */
    function appendNoteInputEntity(noteInputEntityEntity: NoteInputEntity): void {

        if (!noteEntity.noteInputs)
            return;
    
        noteEntity.noteInputs = [...noteEntity.noteInputs, noteInputEntityEntity];

        const newNoteInput = createNoteInputByNoteInputType(noteInputEntityEntity, noteInputs.length);
        setNoteInputs([...noteInputs, newNoteInput]);

        noteEdited();
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
                    onClick={handleAddCodeNoteInput}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    <img src="/img/vscode_blue.webp" alt="vscode" height={20} />
                    {/* <i className="fa-solid fa-code"></i> */}
                </ButtonWithSlideLabel>
            </div>

            <div className="col-4">
                <ButtonWithSlideLabel 
                    className="fullWidth addCodeNoteInputWithVariablesButton" 
                    label="Code with Variables" 
                    title="Add code section with variables"
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