import React, { CSSProperties, forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import "../../assets/styles/RadioButton.scss";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import { log } from "../../helpers/utils";
import Flex from "./Flex";
import HiddenInput from "./HiddenInput";


interface Props extends HelperProps {

    /** Will be passed as ```name``` attr to the hidden radio input. Needs to be unique through out the document for all radio groups to work. */
    radioGroup: string,
    /** Index of this radio button inside the ```radioGroup```. Needs to be unique within the ```radioGroup```. */
    radioIndex: number,
    /** State with the index of the radio button that is currently checked. */
    checkedRadioIndex: number,
    /** State setter for ```checkedRadioIndex```. */
    setCheckedRadioIndex: (checkedRadioIndex: number) => void,
    /** If ```true``` the children (or default icon) will be visible while checked. Default is ```false``` */
    dontHideChildren?: boolean,
    /** Style. Default is ```false``` */
    _checked?: CSSProperties
}


/**
 * Custom radio button.
 * 
 * @since 0.0.1
 */
export default forwardRef(function RadioButton(
    {
        radioGroup,
        radioIndex,
        checkedRadioIndex,
        setCheckedRadioIndex,
        rendered = true,
        disabled = false,
        dontHideChildren = false,
        title = "",
        onClick,
        _checked = {},
        _hover = {},
        _disabled = {
            cursor: "default",
            opacity: 0.5
        },
        ...otherProps
    }: Props,
    ref: Ref<HTMLInputElement>
) {

    const [checked, setChecked] = useState(isChecked());

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "RadioButton");

    const inputRef = useRef(null);

    useImperativeHandle(ref, () => inputRef.current!, []);


    useEffect(() => {
        setChecked(isChecked());
        
    }, [checkedRadioIndex]);


    useEffect(() => {
        if (checked)
            checkRadioButton();

    }, [checked]);


    function isChecked(): boolean {

        return checkedRadioIndex === radioIndex;
    }


    function handleClick(event): void {

        if (disabled)
            return;

        setCheckedRadioIndex(radioIndex);

        if (onClick)
            onClick(event);
    }


    function checkRadioButton(): void {

        if (disabled)
            return;
        
        $(inputRef.current!).prop("checked", true);
    }


    return (
        <Flex 
            id={id} 
            className={className}
            style={{
                ...style,
                ...(checked ? _checked : {}),
                ...(disabled ? _disabled : {})
            }}
            _hover={_hover}
            rendered={rendered}
            onClick={handleClick}
            title={title}
            horizontalAlign="center"
            verticalAlign="center"
        >
            <HiddenInput 
                type="radio" 
                className="radioButtonInput"
                name={radioGroup}
                ref={inputRef}
                disabled={disabled}
            />

            {/* Content */}
            <Flex 
                className="radioButtonContent" 
                style={{visibility: (checked || dontHideChildren ? "visible" : "hidden")}}
                title={title}
                horizontalAlign="center"
                verticalAlign="center"
            >
                {children || <div className="defaultIcon"></div>}
            </Flex>
        </Flex>
    )
})