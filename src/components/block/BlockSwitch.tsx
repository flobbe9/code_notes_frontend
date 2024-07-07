import React, { useState } from "react";
import "../../assets/styles/BlockSwitch.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import RadioButton from "../helpers/RadioButton";
import { getRandomString } from "../../helpers/utils";


interface Props extends DefaultProps {

}


/**
 * Component with radio buttons to switch block types.
 * 
 * @since 0.0.1
 */
export default function BlockSwitch({...otherProps}: Props) {
    
    const [checkedRadioIndex, setCheckedRadioIndex] = useState(0);

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "BlockSwitch");

    const radioGroup = getRandomString();

    return (
        <Flex 
            id={id}
            className={className}
            style={style}
            flexWrap="nowrap"
        >
            {/* TextBlock switch */}
            <RadioButton 
                className="blockSwitch"
                radioGroup={radioGroup} 
                radioIndex={0}
                checkedRadioIndex={checkedRadioIndex}
                setCheckedRadioIndex={setCheckedRadioIndex}
                dontHideChildren
                title="Plain text"
                _checked={{backgroundColor: "orange"}} 
            >
                <i className="fa-solid fa-align-left"></i>
            </RadioButton>

            {/* CodeBlock switch */}
            <RadioButton
                className="blockSwitch"
                radioGroup={radioGroup} 
                radioIndex={1}
                checkedRadioIndex={checkedRadioIndex}
                setCheckedRadioIndex={setCheckedRadioIndex}
                dontHideChildren
                title="Code"
                _checked={{backgroundColor: "orange"}} 
            >
                <i className="fa-solid fa-code"></i>
            </RadioButton>

            {/* CodBlockWithVariable switch */}
            <RadioButton
                className="blockSwitch"
                radioGroup={radioGroup} 
                radioIndex={2}
                checkedRadioIndex={checkedRadioIndex}
                setCheckedRadioIndex={setCheckedRadioIndex}
                dontHideChildren
                title="Code with variables"
                _checked={{backgroundColor: "orange"}} 
            >
                <i className="fa-solid fa-dollar-sign"></i>
                <span className="curlyBraces">&#123;&#125;</span> 
            </RadioButton>

            {children}
        </Flex>
    )
}