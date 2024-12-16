import React, { createContext, RefObject, useRef } from "react";
import { DefaultNoteInputProps } from "../../../../abstract/DefaultNoteInputProps";
import { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import "../../../../assets/styles/DefaultCodeNoteInput.scss";
import Flex from "../../../helpers/Flex";
import DefaultNoteInput from "./DefaultNoteInput";


interface Props extends DefaultNoteInputProps {

}


/**
 * @since 0.0.1
 */
export default function DefaultCodeNoteInput({noteInputEntity, propsKey, ...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultCodeNoteInput");

    const componentRef = useRef<HTMLDivElement>(null);

    const context = {
        componentRef
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
                        {children}
                    </Flex>
                </div>
            </DefaultNoteInput>
        </DefaultCodeNoteInputContext.Provider>
    )
}


export const DefaultCodeNoteInputContext = createContext({
    componentRef: {} as RefObject<HTMLDivElement>
});