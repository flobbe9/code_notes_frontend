import React from "react";
import "../../assets/styles/BlockContainer.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import DefaultCodeBlock from "./DefaultCodeBlock";
import CodeBlock from "./CodeBlock";
import PlainTextBlock from "./PlainTextBlock";
import CodeBlockWithVariables from "./CodeBlockWithVariables";
import Button from "../helpers/Button";
import BlockContainerTagList from "./BlockContainerTagList";
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
                <BlockContainerTagList />
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

    <DefaultCodeBlock>
        <CodeBlock />
    </DefaultCodeBlock>,

    <DefaultCodeBlock>
        <CodeBlockWithVariables />
    </DefaultCodeBlock>
]