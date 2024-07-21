import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/DefaultBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import BlockSwitch from "./BlockSwitch";
import SearchBar from "../helpers/SearchBar";
import LanguageSearchResults from "../LanguageSearchResults";
import { log } from "../../helpers/utils";
import BlockSettings from "./BlockSettings";


interface Props extends DefaultProps {

}


/**
 * Parent component for any block component. Defines some default behaviour and styling for all blocks.
 * 
 * Is referred to as "Section" for the user.
 *  
 * @since 0.0.1
 */
export default function DefaultBlock({...props}: Props) {

    const [isShowBlockSettings, setIsShowBlockSettings] = useState(false);
    const [areBlockSettingsDisabled, setAreBlockSettingsDisabled] = useState(false);

    // codeblock language state
    const [codeBlockLanguage, setCodeBlockLanguage] = useState("");
    // code block with vars language

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultBlock");

    const componentRef = useRef(null);

    const context = {
        isShowBlockSettings, 
        setIsShowBlockSettings,
        areBlockSettingsDisabled,
        setAreBlockSettingsDisabled,

        codeBlockLanguage, 
        setCodeBlockLanguage
    }

    // TODO:
        // drag and drop?
        // pass block type in here


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
                {/* TODO: pass block type
                            make block type enum
                */}
                <BlockSettings areBlockSettingsDisabled={areBlockSettingsDisabled} />
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
    setCodeBlockLanguage: (language: string) => {}
});