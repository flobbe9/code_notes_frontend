import React, { useContext, useEffect, useState } from "react";
import "../../assets/styles/BlockContainerTagList.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperDiv from "../helpers/HelperDiv";
import TagInput from "../TagInput";
import Flex from "../helpers/Flex";
import { Note } from "../../abstract/entites/Note";
import { BlockContainerContext } from "./BlockContainer";
import { getRandomString } from './../../helpers/utils';


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function BlockContainerTagList({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "BlockContainerTagList");

    const [tags, setTags] = useState<JSX.Element[]>();

    const { note } = useContext(BlockContainerContext);


    useEffect(() => {
        setTags(mapTagsToJsx());

    }, []);


    function mapTagsToJsx(): JSX.Element[] {

        // case: note has no tags
        if (!note.tags || !note.tags.length)
            return [<TagInput key={getRandomString()} />];

        return note.tags.map(tag => 
            <TagInput tag={tag} key={getRandomString()} />);
    }


    return (
        <HelperDiv
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            <Flex className="tagInputContainer fullHeight" flexWrap="nowrap">
                {tags}
            </Flex>

            {children}
        </HelperDiv>
    )
}