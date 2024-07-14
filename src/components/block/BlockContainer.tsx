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
import { getRandomString } from "../../helpers/utils";
import BlockContainerTitle from "./BlockContainerTitle";


interface Props extends DefaultProps {

}


/**
 * Container containing a list of different ```Block``` components.
 * @since 0.0.1
 */
export default function BlockContainer({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "BlockContainer");

    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            <div className="contentContainer">
                <Flex className="fullWidth" flexWrap="nowrap">
                    {/* Title */}
                    <BlockContainerTitle className="me-1 col-6" />

                    {/* Tags */}
                    <BlockContainerTagList className="col-6" />
                </Flex>

                {/* List of blocks */}
                {testBlockList}
            </div>
                
            {/* Container Footer */}
            {/* TOOD: add some kind of onclick style */}
            <Flex className="footer mt-1 me-2" horizontalAlign="right">
                {/* Delete */}
                <Button 
                    className="me-2 hover transition" 
                    title="Delete note" 
                    style={{backgroundColor: "rgb(248, 141, 141)"}}
                >
                    <i className="fa-solid fa-trash"></i>
                </Button>

                {/* Save */}
                <Button 
                    className="hover" 
                    title="Save note"
                    style={{backgroundColor: "rgb(141, 141, 248)"}}
                >
                    <i className="fa-solid fa-floppy-disk"></i>
                </Button>
            </Flex>

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