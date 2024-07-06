import React, { CSSProperties, forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import "../../assets/styles/Checkbox.scss";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import HelperDiv from "./HelperDiv";
import { log } from "../../helpers/utils";
import Flex from "./Flex";


interface Props extends HelperProps {

    /** Style. Default is {} */
    _checked?: CSSProperties,

    isChecked?: boolean,
    setIsChecked?: (isChecked: boolean) => void,

    /** If ```true``` the children (or default icon) wont be hidden while not checked */
    dontHideChildren?: boolean
}


/**
 * Custom checkbox with minimal styles. Try to keep component's ```position: relative``` though since the hidden input
 * has ```position: absolute```.
 * 
 * @since 0.0.1
 */
export default forwardRef(function Checkbox({
        rendered = true,
        disabled = false,
        title = "",
        onClick,
        isChecked = false,
        setIsChecked,
        dontHideChildren = false,
        _hover = {},
        _disabled = {},
        _checked = {},
        ...otherProps
    }: Props,
    ref: Ref<HTMLInputElement>
) {

    const [checked, setChecked] = useState(isChecked);

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "Checkbox");

    const componentRef = useRef(null);

    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        handleInnerStateChange();

    }, [checked]);


    useEffect(() => {
        handleOuterStateChange();

    }, [isChecked]);


    function handleClick(event): void {

        if (disabled)
            return;

        setChecked(!checked)

        if (onClick)
            onClick(event);
    }


    /**
     * Handle state change of ```isChecked``` prop if present
     */
    function handleOuterStateChange(): void {

        setChecked(isChecked);
    }

    
    /**
     * Handle state change of ```checked``` state
     */
    function handleInnerStateChange(): void {

        if (setIsChecked)
            setIsChecked(checked);
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
            title={title}
            rendered={rendered}
            onClick={handleClick}
            verticalAlign="center"
            horizontalAlign="center"
            ref={componentRef}
            _hover={_hover}
        >
            <input 
                type="checkbox" 
                className="checkboxInput"
                checked={checked}
                disabled={disabled}
                hidden
            />
                
            <HelperDiv className="checkboxContent dontSelectText" rendered={checked || dontHideChildren}>
                {children || <i className="fa-solid fa-check"></i>}
            </HelperDiv>
        </Flex>
    )
})