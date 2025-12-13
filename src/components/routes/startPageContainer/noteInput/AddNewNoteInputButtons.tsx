import React, { useContext } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { NoteInputEntity } from "../../../../abstract/entites/NoteInputEntity";
import { NoteInputType } from "../../../../abstract/NoteInputType";
import { CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE, getDefaultVariableInput } from "../../../../helpers/constants";
import { sleep } from "../../../../helpers/utils";
import { AppFetchContext } from "../../../AppFetchContextProvider";
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

    const { isLoggedIn, notesUseQueryResult, editedNoteEntities } = useContext(AppFetchContext);
    const { 
        noteEntity, 
        updateNoteEdited, 
        setAreNoteInputsExpanded,
        gotNewNoteInputs,
        setGotNewNoteInputs
    } = useContext(NoteContext);


    function handleAddCodeNoteInput(): void {
         
        // case: not noteInputs yet
        if (!noteEntity.noteInputs)
            noteEntity.noteInputs = [];

        appendNoteInputEntity(getNewNoteInputEntityCode());
    }


    function handleAddPlainTextNoteInput(): void {
         
        // case: not noteInputs yet
        if (!noteEntity.noteInputs)
            noteEntity.noteInputs = [];

        appendNoteInputEntity(getNewNoteInputEntityPlainText());
    }


    function handleAddCodeNoteInputWithVariables(): void {

        // case: not noteInputs yet
        if (!noteEntity.noteInputs)
            noteEntity.noteInputs = [];
 
        appendNoteInputEntity(getNewNoteInputEntityWithVariables());
    }

    
    function getNewNoteInputEntityPlainText(): NoteInputEntity {

        let value = "";
        const noteEntities = isLoggedIn ? notesUseQueryResult.data.results : editedNoteEntities;

        // case: is first note and first noteInput
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
        const noteEntities = isLoggedIn ? notesUseQueryResult.data.results : editedNoteEntities;

        // case: is first note and first noteInput
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
        const noteEntities = isLoggedIn ? notesUseQueryResult.data.results : editedNoteEntities;

        // case: is first note and first noteInput
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

        // notify <Note>
        setGotNewNoteInputs(!gotNewNoteInputs);
        noteEntity.noteInputs = [...noteEntity.noteInputs, noteInputEntity];

        updateNoteEdited();
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
                    <div className="dontBreakText">
                        <i className="fa-solid fa-plus me-2"></i>
                        <i className="fa-solid fa-dollar-sign"></i>
                        <span className="curlyBraces">&#123;&#125;</span> 
                    </div>
                </ButtonWithSlideLabel>
            </div>
                
            {children}
        </Flex>
    )
}
