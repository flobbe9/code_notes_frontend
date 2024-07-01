import React from "react";
import "../assets/styles/CodeNotesIcon.css";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Flex from "./helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function CodeNotesIcon({...otherProps}: Props) {

    const { id, className, style } = getCleanDefaultProps(otherProps, "CodeNotesIcon");

    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            verticalAlign="center"
        >
            <img id="htmlBracketsIcon" className="icon invertColor" src="/img/htmlBrackets.png" alt="html brackets" height={13} />

            <img id="noteBookIcon" className="icon invertColor" src="/img/notebook.png" alt="notebook" height={30} />
        </Flex>
    )
}