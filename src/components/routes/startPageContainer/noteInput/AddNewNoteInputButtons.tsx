import React, { useContext } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import { NoteInputType } from "../../../../abstract/NoteInputType";
import "../../../../assets/styles/AddNewNoteInputButtons.scss";
import { CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE, getDefaultVariableInput } from "../../../../helpers/constants";
import { sleep } from "../../../../helpers/utils";
import { AppFetchContext } from "../../../AppFetchContextHolder";
import ButtonWithSlideLabel from "../../../helpers/ButtonWithSlideLabel";
import Flex from "../../../helpers/Flex";
import { NoteContext } from "./Note";


interface Props extends DefaultProps {

}


/**
 * Container component with buttons that add a new noteInput to a noteInput container.
 * 
 * @since 0.0.1
 */
export default function AddNewNoteInputButtons({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteInputButtons");

    const { noteEntities } = useContext(AppFetchContext);
    const { 
        noteEntity, 
        noteEdited, 
        setAreNoteInputsExpanded
    } = useContext(NoteContext);


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

        // case: first noteInput with variables
        if (!hasNoteEntityNoteInputOfType("PLAIN_TEXT"))
            // add tutorial text
            value = "Plain text and some <code>code...</code>";

        return {
            value: value,
            type: "PLAIN_TEXT"
        }
    }


    function getNewNoteInputEntityWithVariables(): NoteInputEntity {

        let value = "";

        // case: first noteInput with variables
        if (!hasNoteEntityNoteInputOfType("CODE_WITH_VARIABLES"))
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

        // case: first noteInput with variables
        if (!hasNoteEntityNoteInputOfType("CODE"))
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
     * Appends given ```noteInputEntity```. A new noteInput will be appended in ```<Note>```.
     * 
     * @param noteInputEntity to add
     */
    async function appendNoteInputEntity(noteInputEntity: NoteInputEntity): Promise<void> {

        if (!noteEntity || !noteEntity.noteInputs)
            return;

        setAreNoteInputsExpanded(true);
        // wait for noteInputs to be expanded
        await sleep(100);

        noteEntity.noteInputs = [...noteEntity.noteInputs, noteInputEntity];

        noteEdited();

        // not on render
        // not on page load
        // not on delete input

        // is expanded
        // has at least one element
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
                    label="Plain text" 
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
                    <img src="/img/vsStudio_purple.png" className="vsStudioIcon" alt="vscode" height={20} />
                </ButtonWithSlideLabel> 
            </div>

            <div className="col-4">
                <ButtonWithSlideLabel 
                    className="fullWidth addCodeNoteInputWithVariablesButton" 
                    label="Code with variables" 
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