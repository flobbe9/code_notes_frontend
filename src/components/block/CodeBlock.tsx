import React, { useRef } from "react";
import "../../assets/styles/CodeBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { Editor, useMonaco } from "@monaco-editor/react";
import Flex from "../helpers/Flex";
import { isBlank, isNumberFalsy, log, logError } from "../../helpers/utils";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
// TODO: causes resize error (see https://stackoverflow.com/questions/76187282/react-resizeobserver-loop-completed-with-undelivered-notifications)
export default function CodeBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "CodeBlock");

    const componentRef = useRef(null);

    const monaco = useMonaco();

    /** Height of one line of the monaco vscode editor in px */
    const vsCodeLineHeight = 19; // px

    function handleChange(value: string, event): void {

        const lineContainer = $(componentRef.current!).find(".view-lines");
        const lineContainerHeight = lineContainer.height();
        
        const lines = lineContainer.find(".view-line");
        const actualLineContainerHeight = lines.length * vsCodeLineHeight;
        // TODO: 
            // language 
                // add to section settings
                // drop down (?)
            // height
                // one line
                // resize on enter
                    // keep first line in view
                // full size mode
            // resize error
            // width
                // does not adjust to changes

        // get height of line container
        // set height of editor

        if (monaco) {
            log(event.changes[0])
        }


        const editor = getEditorSection();
        if (lineContainerHeight)
        editor.css("height", lineContainerHeight);
    }


    function getEditorSection(): JQuery {

        return $(componentRef.current!).children("section");
    }


    return (
        <div 
            id={id} 
            className={className + " fullWidth"}
            style={style}
            ref={componentRef}
            {...otherProps}
        >
            {
                // editable
                // 
            }
                
            {children}
        </div>
    )
}