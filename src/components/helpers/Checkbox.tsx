import { CSSProperties, forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import Flex from "./Flex";
import HiddenInput from "./HiddenInput";


interface Props extends HelperProps {

    /** Style. Default is {} */
    _checked?: CSSProperties,

    isChecked?: boolean,
    /** Triggered on click */
    setIsChecked?: (isChecked: boolean) => void,

    /** If ```true``` the children (or default icon) will be visible while checked. Default is ```false``` */
    dontHideChildren?: boolean
}


/**
 * Custom checkbox with minimal styles. 
 * 
 * @since 0.0.1
 */
export default forwardRef(function Checkbox({
        rendered = true,
        disabled = false,
        title = "",
        isChecked = false,
        setIsChecked,
        dontHideChildren = false,
        tabIndex,
        onClick,
        onChange,
        _hover = {},
        _disabled = {
            cursor: "default",
            opacity: 0.5
        },
        _checked = {},
        ...props
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    const [checked, setChecked] = useState(isChecked);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Checkbox");

    const componentRef = useRef<HTMLDivElement>(null);

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

        if (onChange)
            onChange(event);
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
            verticalAlign="center"
            horizontalAlign="center"
            ref={componentRef}
            onClick={handleClick}
            _hover={checked ? _hover : {}}
            {...otherProps}
        >
            <HiddenInput
                type="checkbox"
                className="Checkbox-input"
                checked={checked}
                disabled={disabled}
                tabIndex={tabIndex}
             />
                
            <Flex 
                className="Checkbox-content dontSelectText" 
                rendered={checked || dontHideChildren}
                verticalAlign="center"
                title={title}
            >
                {children || <i className="fa-solid fa-check"></i>}
            </Flex>
        </Flex>
    )
})
