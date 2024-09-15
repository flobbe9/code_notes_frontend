import $ from "jquery";
import React, { createContext, useRef } from "react";
import "../../assets/styles/DefaultCodeNoteInput.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultNoteInput from "./DefaultNoteInput";
import Flex from "../helpers/Flex";
import { NoteInputEntity } from "../../abstract/entites/NoteInputEntity";
import { log } from "../../helpers/utils";


interface Props extends DefaultProps {

    noteInputEntity: NoteInputEntity,

    propsKey: string
}


/**
 * @since 0.0.1
 */
export default function DefaultCodeNoteInput({noteInputEntity, propsKey, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultCodeNoteInput");

    const componentRef = useRef(null);

    const context = {
        
    }

    
    return (
        <DefaultCodeNoteInputContext.Provider value={context}>
            <DefaultNoteInput noteInputEntity={noteInputEntity} propsKey={propsKey}>
                <div     
                    id={id} 
                    className={className}
                    style={style}
                    ref={componentRef}
                    {...otherProps}
                >
                    <Flex flexWrap="nowrap">
                        {/* CodeNoteInput */}
                        {children}
                    </Flex>
                </div>
            </DefaultNoteInput>
        </DefaultCodeNoteInputContext.Provider>
    )
}


export const DefaultCodeNoteInputContext = createContext({
});