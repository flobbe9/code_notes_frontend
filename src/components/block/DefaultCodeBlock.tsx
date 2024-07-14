import React from "react";
import "../../assets/styles/DefaultCodeBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import ContentEditableDiv from "../helpers/ContentEditableDiv";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function DefaultCodeBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultCodeBlock");

    return (
        <DefaultBlock>
            {/* TODO: is this div necessary? */}
            <div     
                id={id} 
                className={className}
                style={style}
                {...otherProps}
            >
                <Flex className="" flexWrap="nowrap">
                    {children}

                    <Flex horizontalAlign="right">
                        <Button className="defaultBlockButton hover copyButton">
                            <i className="fa-solid fa-copy"></i>
                        </Button>
                    </Flex>
                </Flex>
            </div>
        </DefaultBlock>
    )
}