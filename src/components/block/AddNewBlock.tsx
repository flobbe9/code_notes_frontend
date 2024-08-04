import React, { useContext } from "react";
import "../../assets/styles/AddNewBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import { log } from "../../helpers/utils";
import ButtonWithSlideLabel from "../helpers/ButtonWithSlideLabel";
import { Note } from "../../abstract/entites/Note";
import { BlockContainerContext } from "./BlockContainer";


interface Props extends DefaultProps {

}


/**
 * Container component with buttons that add a new block to a block container.
 * 
 * @since 0.0.1
 */
export default function AddNewBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewBlock");

    const { note } = useContext(BlockContainerContext);


    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            flexWrap="nowrap"
            {...otherProps}
        >
            <div className="col-4 ps-2 pe-2">
                <ButtonWithSlideLabel 
                    className="fullWidth hover" 
                    label="Plain Text" 
                    title="Add plain text section"
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-align-left"></i>
                </ButtonWithSlideLabel>
            </div>

            <div className="col-4 ps-2 pe-2">
                <ButtonWithSlideLabel className="fullWidth hover" label="Code" title="Add code section">
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-code"></i>
                </ButtonWithSlideLabel>
            </div>

            <div className="col-4 ps-2 pe-2">
                <ButtonWithSlideLabel className="fullWidth hover" label="Code with Variables" title="Add code with variables section">
                    <i className="fa-solid fa-plus me-2"></i>
                    <i className="fa-solid fa-dollar-sign"></i>
                    <span className="curlyBraces">&#123;&#125;</span> 
                </ButtonWithSlideLabel>
            </div>
                
            {children}
        </Flex>
    )
}