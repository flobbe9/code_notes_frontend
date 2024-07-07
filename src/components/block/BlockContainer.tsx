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
import ContentEditableDiv from "../helpers/ContentEditableDiv";
import { getRandomString } from "../../helpers/utils";


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
            <Flex className="mb-3">
                {/* Title */}
                <ContentEditableDiv
                    id={id} 
                    className={className + " blockContainerTitle"}
                    style={style}
                    _focus={{
                        borderColor: "orange",
                        outline: "none"
                    }}
                >
                    Title...
                </ContentEditableDiv>

                {/* Tags */}
                <BlockContainerTagList />

                {/* Container Footer */}
                {/* <Flex className="blockContainerFooter" horizontalAlign="right">
                    <Button>Delete</Button>

                    <Button>Save</Button>
                </Flex> */}
            </Flex>

            {/* List of blocks */}
            {testBlockList}
                
            {children}
        </div>
    )
}


const testBlockList = [
    <DefaultBlock key={getRandomString()}>
        <PlainTextBlock />
    </DefaultBlock>,

    <DefaultCodeBlock key={getRandomString()}>
        <CodeBlock />
    </DefaultCodeBlock>,

    <DefaultCodeBlock key={getRandomString()}>
        <CodeBlockWithVariables />
    </DefaultCodeBlock>
]