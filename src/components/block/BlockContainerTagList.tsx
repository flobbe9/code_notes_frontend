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
export default function BlockContainerTagList({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "BlockContainerTagList");


    return (
        <HelperDiv
            id={id} 
            className={className}
            style={style}
            {...otherProps}
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