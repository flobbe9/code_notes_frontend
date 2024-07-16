import React, { useRef } from "react";
import "../../assets/styles/DefaultCodeBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import { log } from "../../helpers/utils";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function DefaultCodeBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultCodeBlock");

    const copyIconRef = useRef(null);


    function animateCopyIcon(): void {

        const copyIcon = $(copyIconRef.current!);

        copyIcon.animate(
            {
                opacity: 0,
                fontSize: "3em"
            },
            400,
            "easeOutSine",
            () => {
                copyIcon.css("opacity", 1);
                copyIcon.css("fontSize", "1em");
            }
        );
    }


    return (
        <DefaultBlock>
            <div     
                id={id} 
                className={className}
                style={style}
                {...otherProps}
            >
                <Flex flexWrap="nowrap">
                    {children}

                    <Flex horizontalAlign="right">
                        {/* Copy */}
                        <Button
                            className="defaultBlockButton hover copyButton"
                            title="Copy"
                            onClick={animateCopyIcon}
                        >
                            <i className="fa-solid fa-copy" ref={copyIconRef}></i>
                            <i className="fa-solid fa-copy"></i>
                        </Button>
                    </Flex>
                </Flex>
            </div>
        </DefaultBlock>
    )
}