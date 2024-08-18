import React, { useContext } from "react";
import "../../assets/styles/AddNewBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import { log } from "../../helpers/utils";
import ButtonWithSlideLabel from "../helpers/ButtonWithSlideLabel";
import { BlockContainerContext } from "./BlockContainer";
import { NoteInput } from "../../abstract/entites/NoteInput";
import { NoteInputType } from "../../abstract/NoteInputType";
import { CODE_BLOCK_DEFAULT_LANGUAGE, CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE, getDefaultVariableInput, VARIABLE_INPUT_DEFAULT_PLACEHOLDER } from "../../helpers/constants";


interface Props extends DefaultProps {

}


/**
 * Container component with buttons that add a new block to a block container.
 * 
 * @since 0.0.1
 */
export default function AddNewBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewBlock");

    const { note, blocks, setBlocks, numBlocksParsing, getBlockByNoteInputType } = useContext(BlockContainerContext);


    function handleAddPlainTextBlock(event): void {
         
        // case: not blocks yet
        if (!note.noteInputs)
            note.noteInputs = [];
 
        const newPlainTextBlock: NoteInput = {
            value: "Plain text and some <code>code...</code>",
            type: NoteInputType.PLAIN_TEXT
        }

        appendNoteInput(newPlainTextBlock);
    }


    function handleAddCodeBlockWithVariables(event): void {

        // case: not blocks yet
        if (!note.noteInputs)
            note.noteInputs = [];
 
        const newCodeBlockWithVariables: NoteInput = {
            // TODO: make this a constant
            value: "Some code and a variable x = " + getDefaultVariableInput() + ". Click the 3 dots on the right to change the programming language.",
            type: NoteInputType.CODE_WITH_VARIABLES,
            programmingLanguage: CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE
        }

        appendNoteInput(newCodeBlockWithVariables);
    }

 
    function handleAddCodeBlock(event): void {

        // case: not blocks yet
        if (!note.noteInputs)
            note.noteInputs = [];
 
        const newCodeBlock: NoteInput = {
            value: "",
            type: NoteInputType.CODE,
            programmingLanguage: CODE_BLOCK_DEFAULT_LANGUAGE
        }

        appendNoteInput(newCodeBlock);        
    }


    /**
     * Appends a new ```noteInput``` and given ```noteInputEntity``` to their corresponding states.
     * 
     * @param noteInputEntity to add
     */
    function appendNoteInput(noteInputEntity: NoteInput): void {

        if (!note.noteInputs)
            return;
    
        // update app user
        note.noteInputs = [...note.noteInputs, noteInputEntity];

        // update noteInputs
        let newNoteInputs = blocks;
        const newNoteInput = getBlockByNoteInputType(noteInputEntity);
        newNoteInputs = [...newNoteInputs, newNoteInput];
        setBlocks(newNoteInputs);
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
                    className="fullWidth addPlainTextBlockButton" 
                    label="Plain Text" 
                    title="Add plain text section"
                    disabled={numBlocksParsing > 0}
                    onClick={handleAddPlainTextBlock}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-align-left"></i>
                </ButtonWithSlideLabel>
            </div>

            <div className="col-4 pe-2">
                <ButtonWithSlideLabel 
                    className="fullWidth addCodeBlockButton" 
                    label="Code" 
                    title="Add code section"
                    disabled={numBlocksParsing > 0}
                    onClick={handleAddCodeBlock}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-code"></i>
                </ButtonWithSlideLabel>
            </div>

            <div className="col-4">
                <ButtonWithSlideLabel 
                    className="fullWidth addCodeBlockWithVariablesButton" 
                    label="Code with Variables" 
                    title="Add code with variables section"
                    disabled={numBlocksParsing > 0}
                    onClick={handleAddCodeBlockWithVariables}
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