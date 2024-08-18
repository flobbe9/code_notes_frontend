import React, { createContext, useRef } from "react";
import "../../assets/styles/DefaultCodeBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import Flex from "../helpers/Flex";
import { NoteInput } from "../../abstract/entites/NoteInput";
import { log } from "../../helpers/utils";


interface Props extends DefaultProps {

    noteInput: NoteInput,

    propsKey: string
}


/**
 * @since 0.0.1
 */
export default function DefaultCodeBlock({noteInput, propsKey, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultCodeBlock");

    const componentRef = useRef(null);

    const context = {
        
    }

    
    return (
        <DefaultCodeBlockContext.Provider value={context}>
            <DefaultBlock noteInput={noteInput} propsKey={propsKey}>
                <div     
                    id={id} 
                    className={className}
                    style={style}
                    ref={componentRef}
                    {...otherProps}
                >
                    <Flex flexWrap="nowrap">
                        {/* CodeBlock */}
                        {children}
                    </Flex>
                </div>
            </DefaultBlock>
        </DefaultCodeBlockContext.Provider>
    )
}


export const DefaultCodeBlockContext = createContext({
});