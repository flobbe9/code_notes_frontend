import React from "react";
import "../../assets/styles/BlockContainerTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperDiv from "../helpers/HelperDiv";
import TagInput from "../TagInput";
import Flex from "../helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function BlockContainerTagList({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "BlockContainerTagList");


    return (
        <HelperDiv
            id={id} 
            className={className}
            style={style}
        >
            <Flex className="tagInputContainer" flexWrap="nowrap">
                <TagInput className="me-2" />
                <TagInput className="me-2" />
                <TagInput className="me-2" />
                <TagInput className="me-2" />
                
                <TagInput className="me-2" />
                <TagInput className="me-2" />
                <TagInput className="me-2" />
                <TagInput className="me-2" />


            </Flex>

            {children}
        </HelperDiv>
    )
}