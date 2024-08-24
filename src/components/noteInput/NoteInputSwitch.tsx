import React, { forwardRef, Ref, useState } from "react";
import "../../assets/styles/NoteInputSwitch.scss";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import RadioButton from "../helpers/RadioButton";
import { getRandomString } from "../../helpers/utils";
import HelperProps from "../../abstract/HelperProps";


interface Props extends HelperProps {
    tabIndex: number
}


/**
 * Component with radio buttons to switch noteInput types.
 * 
 * @since 0.0.1
 */
export default forwardRef(function NoteInputSwitch({
    title = "",
    rendered,
    tabIndex,
    _hover = {},
    ...props
}: Props, ref: Ref<HTMLDivElement>) {
    
    const [checkedRadioIndex, setCheckedRadioIndex] = useState(0);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "NoteInputSwitch");

    const radioGroup = getRandomString();

    return (
        <Flex 
            id={id}
            className={className}
            style={style}
            flexWrap="nowrap"
            rendered={rendered}
            title={title}
            ref={ref}
            _hover={_hover}
            {...otherProps}
        >
            {/* TextNoteInput switch */}
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

            {/* CodeNoteInput switch */}
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

            {/* CodNoteInputWithVariable switch */}
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