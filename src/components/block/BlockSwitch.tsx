import React, { forwardRef, Ref, useState } from "react";
import "../../assets/styles/BlockSwitch.scss";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import RadioButton from "../helpers/RadioButton";
import { getRandomString } from "../../helpers/utils";
import HelperProps from "../../abstract/HelperProps";


interface Props extends HelperProps {
    tabIndex: number
}


/**
 * Component with radio buttons to switch block types.
 * 
 * @since 0.0.1
 */
export default forwardRef(function BlockSwitch({
    title = "",
    rendered,
    tabIndex,
    _hover = {},
    ...otherProps
}: Props, ref: Ref<HTMLDivElement>) {
    
    const [checkedRadioIndex, setCheckedRadioIndex] = useState(0);

    const { id, className, style, children, other } = getCleanDefaultProps(otherProps, "BlockSwitch");

    const radioGroup = getRandomString();

    return (
        <Flex 
            id={id}
            className={className}
            style={style}
            flexWrap="nowrap"
            rendered={rendered}
            title={title}
            other={other}
            ref={ref}
            _hover={_hover}
        >
            {/* TextBlock switch */}
            <RadioButton 
                className="switchButton"
                radioGroup={radioGroup} 
                radioIndex={0}
                checkedRadioIndex={checkedRadioIndex}
                setCheckedRadioIndex={setCheckedRadioIndex}
                dontHideChildren
                title="Plain text"
                tabIndex={tabIndex}
                _checked={{borderColor: "var(--accentColor)"}} 
            >
                <i className="fa-solid fa-align-left"></i>
            </RadioButton>

            {/* CodeBlock switch */}
            <RadioButton
                className="switchButton"
                radioGroup={radioGroup} 
                radioIndex={1}
                checkedRadioIndex={checkedRadioIndex}
                setCheckedRadioIndex={setCheckedRadioIndex}
                dontHideChildren
                title="Code"
                tabIndex={tabIndex}
                _checked={{borderColor: "var(--accentColor)"}} 
            >
                <i className="fa-solid fa-code"></i>
            </RadioButton>

            {/* CodBlockWithVariable switch */}
            <RadioButton
                className="switchButton"
                radioGroup={radioGroup} 
                radioIndex={2}
                checkedRadioIndex={checkedRadioIndex}
                setCheckedRadioIndex={setCheckedRadioIndex}
                dontHideChildren
                title="Code with variables"
                tabIndex={tabIndex}
                _checked={{borderColor: "var(--accentColor)"}} 
            >
                <i className="fa-solid fa-dollar-sign"></i>
                <span className="curlyBraces">&#123;&#125;</span> 
            </RadioButton>

            {children}
        </Flex>
    )
})