import React from "react";
import "../../assets/styles/BlockContainer.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import DefaultCodeBlock from "./DefaultCodeBlock";
import CodeBlock from "./CodeBlock";
import PlainTextBlock from "./PlainTextBlock";
import CodeBlockWithVariables from "./CodeBlockWithVariables";
import Button from "../helpers/Button";
import TagContainer from "./TagContainer";
import Flex from "../helpers/Flex";
import BlockContainerTitle from "./BlockContainerTitle";


interface Props extends DefaultProps {

}


/**
 * Container containing a list of different ```Block``` components.
 * @since 0.0.1
 */
export default function BlockContainer({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "BlockContainer");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            <Flex>
                {/* Title */}
                <BlockContainerTitle />

                {/* Tags */}
                <TagContainer />
            </Flex>

            {/* List of blocks */}
            {testBlockList}

            {/* Save button */}
            <Button>Save</Button>

            {/* Delete button */}
            <Button>Delete</Button>
                
            {children}
        </div>
    )
}


const testBlockList = [
    <DefaultBlock>
        <PlainTextBlock />
    </DefaultBlock>,
    <br />,

    <DefaultCodeBlock>
        <CodeBlock />
    </DefaultCodeBlock>,
    <br />,

    <DefaultCodeBlock>
        <CodeBlockWithVariables />
    </DefaultCodeBlock>
]