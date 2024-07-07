import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import { log } from "../../helpers/utils";


interface Props extends HelperProps {

    /** Default is ```false``` */
    contentEditable?: boolean,
}


/**
 * Component applying most helper props like ```_hover```. 
 * 
 * @since 0.0.1
 */
export default forwardRef(function HelperDiv(
    {
        title = "",
        onClick,
        disabled = false,
        rendered = true,
        contentEditable = false,
        _hover = {},
        ...otherProps
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    const [isHover, setIsHover] = useState(false);
    
    const { id, className, style, children, other } = getCleanDefaultProps(otherProps);

    const componentRef = useRef(null)

    // make "ref" usable inside this component
    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {

        toggleIsHover();
    }, []);


    function toggleIsHover(): void {

        const component = $(componentRef.current!);

        component.on("mouseenter", () => setIsHover(true))
                 .on("mouseleave", () => setIsHover(false));
    }

    
    function handleClick(event): void {

        if (disabled)       
            return;

        if (onClick)
            onClick(event);
    }


    return (
        <div 
            id={id} 
            className={className}
            style={{
                ...style,
                ...(isHover && !disabled ? _hover : {}),
            }}
            ref={componentRef}
            title={title}
            onClick={handleClick}
            hidden={!rendered}
            contentEditable={contentEditable}
            {...other}
        >
            {children}
        </div>
    )
})