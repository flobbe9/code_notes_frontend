import React, { useRef, useState } from "react";
import "../../assets/styles/DefaultBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Button from "../helpers/Button";
import BlockSwitch from "./BlockSwitch";


interface Props extends DefaultProps {

}


/**
 * Parent component for any block component. Defines some default behaviour and styling for all blocks.
 * 
 * Is referred to as "Section" for the user.
 *  
 * @since 0.0.1
 */
export default function DefaultBlock({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "DefaultBlock");

    const blockSwitchRef = useRef(null);

    // IDEA: make custom colors and pass them to buttons as border color

    const [isShowBlockSwitch, setIsShowBlockSwitch] = useState(false);


    function toggleBlockSwitch(): void {

        const blockSwitch = $(blockSwitchRef.current!);

        setIsShowBlockSwitch(!isShowBlockSwitch);

        // case: show block switch
        if (!isShowBlockSwitch)
            // radio buttons back to static
            blockSwitch.children(".RadioButton").css("position", "static");

        // fake "toggle slide"
        blockSwitch.animate(
            {
                width: isShowBlockSwitch ? 0 : "136px",
                opacity: isShowBlockSwitch ? 0 : 1,
                zIndex: isShowBlockSwitch ? -1 : 0
            }, 
            300,
            "swing",
            // radio buttons to absolute so they dont widen the container width
            () => blockSwitch.children(".RadioButton").css("position", (isShowBlockSwitch ? "absolute" : "static"))
        )
    }


    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            flexWrap="nowrap"
            verticalAlign="start"
        >
            <Flex className="blockContent fullWidth" flexWrap="nowrap">
                {/* Block */}
                <div className="defaultBlockChildren fullWidth">
                    {children}
                </div>

                {/* Delete button */}
                <Button className="deleteBlockButton defaultBlockButton hover" title="Delete section">
                    <i className="fa-solid fa-xmark"></i>
                </Button>
            </Flex>

            <Flex className="blockSettings" flexWrap="nowrap" verticalAlign="center">
                {/* Block switch */}
                <BlockSwitch className="" ref={blockSwitchRef} tabIndex={isShowBlockSwitch ? 0 : -1} />

                {/* Toggle block switch */}
                <Button 
                    className="toggleBlockSwitchButton ms-1 transition" 
                    style={{backgroundColor: isShowBlockSwitch ? "var(--codeGrey)" : "transparent"}}
                    title="Change section type"
                    onClick={toggleBlockSwitch}
                    _hover={isShowBlockSwitch ? {} : {backgroundColor: "buttonFace"}}
                >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </Button>
            </Flex>
        </Flex>
    )
}