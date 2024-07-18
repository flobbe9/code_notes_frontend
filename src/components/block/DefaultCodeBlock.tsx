import React, { useRef } from "react";
import "../../assets/styles/DefaultCodeBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import Flex from "../helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function DefaultCodeBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultCodeBlock");

    const componentRef = useRef(null);

    
    return (
        <DefaultBlock>
            <div     
                id={id} 
                className={className}
                style={style}
                ref={componentRef}
                {...otherProps}
            >
                <Flex flexWrap="nowrap">
                    {/* CodeBlock */}
                    {children}
                </Flex>
            </div>
        </DefaultBlock>
    )
}