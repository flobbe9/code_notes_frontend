import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/DefaultBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import { log } from "../../helpers/utils";
import BlockSettings from "./BlockSettings";
import { NoteInput } from "../../abstract/entites/NoteInput";
import Overlay from "../helpers/Overlay";
import { CODE_BLOCK_DEFAULT_LANGUAGE, CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE } from "../../helpers/constants";


interface Props extends DefaultProps {

    noteInput: NoteInput
}


/**
 * Parent component for any block component. Defines some default behaviour and styling for all blocks.
 * 
 * Is referred to as "Section" for the user.
 *  
 * @since 0.0.1
 */
export default function DefaultBlock({noteInput, ...props}: Props) {

    const [isShowBlockSettings, setIsShowBlockSettings] = useState(false);
    const [areBlockSettingsDisabled, setAreBlockSettingsDisabled] = useState(false);

    const [codeBlockLanguage, setCodeBlockLanguage] = useState(noteInput.programmingLanguage || CODE_BLOCK_DEFAULT_LANGUAGE);
    const [codeBlockWithVariablesLanguage, setCodeBlockcodeBlockWithVariablesLanguage] = useState(noteInput.programmingLanguage || CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE);

    const [blockOverlayVisible, setBlockOverlayVisible] = useState(false);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultBlock");

    const componentRef = useRef(null);

    const context = {
        isShowBlockSettings, 
        setIsShowBlockSettings,
        areBlockSettingsDisabled,
        setAreBlockSettingsDisabled,

        codeBlockLanguage, 
        setCodeBlockLanguage,

        codeBlockWithVariablesLanguage, 
        setCodeBlockcodeBlockWithVariablesLanguage,

        blockOverlayVisible,
        setBlockOverlayVisible
    }


    return (
        <DefaultBlockContext.Provider value={context}>
            <Flex 
                id={id} 
                className={className}
                style={style}
                flexWrap="nowrap"
                verticalAlign="start"
                horizontalAlign="center"
                ref={componentRef}
                draggable
                {...otherProps}
            >
                <Flex className="blockContent fullWidth" flexWrap="nowrap">
                    {/* Block */}
                    <div className="defaultBlockChildren fullWidth">
                        {children}
                    </div>

                    {/* Delete button */}
                    <Button className="deleteBlockButton defaultBlockButton" title="Delete section">
                        <i className="fa-solid fa-xmark"></i>
                    </Button>
                </Flex>

                {/* Settings */}
                <BlockSettings noteInput={noteInput} areBlockSettingsDisabled={areBlockSettingsDisabled} />

                {/* Overlay */}
                <Overlay 
                    className="blockOverlay flexCenter" 
                    hideOnClick={false}
                    fadeInDuration={0}
                    isOverlayVisible={blockOverlayVisible} 
                    setIsOverlayVisible={setBlockOverlayVisible}
                >
                    <i className={"fa-solid fa-circle-notch rotating"}></i>
                </Overlay>
            </Flex>

        </DefaultBlockContext.Provider>
    )
}


export const DefaultBlockContext = createContext({
    isShowBlockSettings: false,
    setIsShowBlockSettings: (isShow: boolean) => {},
    areBlockSettingsDisabled: false,
    setAreBlockSettingsDisabled: (areDisabled: boolean) => {},

    codeBlockLanguage: "",
    setCodeBlockLanguage: (language: string) => {},

    codeBlockWithVariablesLanguage: "", 
    setCodeBlockcodeBlockWithVariablesLanguage: (language: string) => {},

    blockOverlayVisible: false,
    setBlockOverlayVisible: (isVisible: boolean) => {}
});