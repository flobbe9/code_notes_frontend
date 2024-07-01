import React from "react";
import "../../assets/styles/DefaultCodeBlock.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import Flex from "../helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function DefaultCodeBlock({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "DefaultCodeBlock");

    return (
        <DefaultBlock 
            id={id} 
            className={className}
            style={style}
        >
            <Flex>
                <div style={{width: "90%"}}>{children}</div>

                <button>Copy</button>
            </Flex>
        </DefaultBlock>
    )
}