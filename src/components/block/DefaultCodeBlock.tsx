import React from "react";
import "../../assets/styles/DefaultCodeBlock.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function DefaultCodeBlock({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "DefaultCodeBlock");

    return (
        <DefaultBlock>
            <div     
                id={id} 
                className={className}
                style={style}
            >
                <Flex flexWrap="nowrap">
                    {children}

                    <Flex horizontalAlign="right" className="fullWidth">
                        <Button className="defaultBlockButton" style={{borderRadius: 0}}>
                            <i className="fa-solid fa-copy"></i>
                        </Button>
                    </Flex>
                </Flex>
            </div>
        </DefaultBlock>
    )
}