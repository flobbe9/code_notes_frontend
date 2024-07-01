import React from "react";
import "../../assets/styles/CodeBlock.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { Editor } from "@monaco-editor/react";
import Flex from "../helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
// TODO: causes resize error (see https://stackoverflow.com/questions/76187282/react-resizeobserver-loop-completed-with-undelivered-notifications)
export default function CodeBlock({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "CodeBlock");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <Editor width={700} height={20} defaultValue="Code block" />
                
            {children}
        </div>
    )
}