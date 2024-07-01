import React from "react";
import "../../assets/styles/CodeBlockWithVariables.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function CodeBlockWithVariables({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "CodeBlockWithVariables");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <Flex flexWrap="nowrap">
                <code className="fullWidth">Code with vars</code>

                <Flex horizontalAlign="right" className="fullWidth">
                    <button>Add variable</button>

                </Flex>
            </Flex>
                
            {children}
        </div>
    )
}