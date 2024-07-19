import React, { useContext, useEffect, useRef, useState } from "react";
import "../../assets/styles/CodeBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { Editor, useMonaco } from "@monaco-editor/react";
import { getCssConstant, getCSSValueAsNumber, isNumberFalsy, log } from "../../helpers/utils";
import { DefaultBlockContext } from "./DefaultBlock";
import { AppContext } from "../App";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function CodeBlock({...props}: Props) {

    /** Height of one line of the monaco vscode editor in px */
    const editorLineHeight = 19; // px

    /** Number of lines visible on render */
    const initialNumLines = 3;

    const maxNumLines = 15;

    // state init width
    const [editorHeight, setEditorHeight] = useState(getInitialEditorHeight());
    const [initEditorWidth, setInitEditorWidth] = useState<number>(NaN);
    const [editorWidth, setEditorWidth] = useState("100%");

    const { getDeviceWidth } = useContext(AppContext);
    const { 
        isShowBlockSettings, 
        
        codeBlockLanguage
    } = useContext(DefaultBlockContext);

    const { isMobileWidth } = getDeviceWidth();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "CodeBlock");

    const componentRef = useRef(null);


    useEffect(() => {
        setTimeout(() => {
            setInitEditorWidth(getEditor().width()!);

        }, 100);
    }, []);

    
    useEffect(() => {
        updateEditorHeight();

    }, [editorHeight]);


    useEffect(() => {
        updateEditorWidth();

    }, [editorWidth]);


    useEffect(() => {
        // case: init width has ben set
        if (!isNumberFalsy(initEditorWidth))
            handleToggleBlockSettings();

    }, [isShowBlockSettings])

    // TODO: 
        // full screen
        // height
            // paste does not increase height enough
                // count lines on control key
                // break if min height is reached
                // set editor height 
        // width
            // blank space on the right

    function handleChange(value: string, event): void {

        setTimeout(() => {
            updateEditorHeight();
        }, 5);
    }


    /**
     * Check if editor height still fits number of rendered lines and adjust if not.
     */
    function updateEditorHeight(): void {

        const linesHeightComparison = compareEditorHeightToLinesHeight();

        // increase editor height if possible
        if (linesHeightComparison === -1 && !isMaxEditorHeight())
            handleAddLine();
        
        // decrease editor height if possible
        else if (linesHeightComparison === 1 && !isMinEditorHeight())
            handleRemoveLine();
    }


    /**
     * Describes the height of the editor in comparison to the height of all rendered editor lines.
     * 
     * Ideally the editor is always 2 lines higher than the current number of lines rendered.
     * 
     * @returns -1 if the editor is too small, 0 if it's the right height and 1 if it's too big
     */
    function compareEditorHeightToLinesHeight(): number {

        const linesHeight = getLinesHeight();
        const heightDifference = editorHeight - linesHeight - (2 * editorLineHeight);

        // dont devide by 0
        if (heightDifference === 0)
            return 0;
        
        return heightDifference / Math.abs(heightDifference);
    }


    function getLinesHeight(): number {

        const component = $(componentRef.current!);

        return component.find(".view-lines .view-line").length * editorLineHeight;

    }
    

    function handleAddLine(): void {

        // case: reached max editor height
        if (isMaxEditorHeight())
            return;

        setEditorHeight(editorHeight + 19);
    }


    function handleRemoveLine(): void {

        setEditorHeight(editorHeight - 19);
    }


    function getEditor(): JQuery {

        return $(componentRef.current!).children("section");
    }


    function getInitialEditorHeight(): number {

        return initialNumLines * editorLineHeight;
    }


    function isMaxEditorHeight(): boolean {

        return editorHeight === maxNumLines * editorLineHeight;
    }


    function isMinEditorHeight(): boolean {

        return editorHeight === getInitialEditorHeight();
    }


    /**
     * Increase or decrease the editors width by the ```<BlockSettings>``` width depending on whether the block settings are visible or not.
     */
    function handleToggleBlockSettings(): void {

        // case: show block settings
        if (isShowBlockSettings) {
            const blockSwitchWidth = getCSSValueAsNumber(getCssConstant("blockSwitchWidth"), 2);
            const languageSearchBarWidth = getCSSValueAsNumber(getCssConstant("languageSearchBarWidth"), 2);
            const blockSettingsWidth = blockSwitchWidth + languageSearchBarWidth;

            const randomOffset = 3; // is a wild guess, depneds on the block settings' width and margin etc

            // if mobile use only language search bar width, since settings will wrap
            const newEditorWidth = initEditorWidth - (isMobileWidth ? languageSearchBarWidth : blockSettingsWidth) + randomOffset; 

            setEditorWidth(newEditorWidth + "px");
        
        // case: hide block settings
        } else
            setEditorWidth(initEditorWidth + "px");
    }


    /**
     * Animate the width of the editor to ```editorWidth```.
     */ 
    function updateEditorWidth(): void {

        getEditor().animate(
            {
                width: editorWidth,
            },
            isShowBlockSettings ? 0 : 300,
            "swing"
        )
    }


    return (
        <div 
            id={id} 
            className={className + " fullWidth"}
            style={style}
            ref={componentRef}
            {...otherProps}
        >
            <Editor 
                className="vsCodeEditor" 
                height={editorHeight} 
                width={"100%"}
                onChange={handleChange}
                language={codeBlockLanguage.toLowerCase()}
            />
                
            {children}
        </div>
    )
}