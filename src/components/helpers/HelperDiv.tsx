import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";


interface Props extends HelperProps {
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
        rendered = true,
        _hover = {},
        ...otherProps
    }: Props,
    ref: Ref<HTMLDivElement>
) {

    
    const [isHover, setIsHover] = useState(false);
    
    const { id, className, style, children } = getCleanDefaultProps(otherProps);

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


    return (
        <div 
            id={id} 
            className={className}
            style={{
                ...style,
                ...(isHover ? _hover : {}),
            }}
            ref={componentRef}
            title={title}
            onClick={onClick}
            hidden={!rendered}
        >
            {children}
        </div>
    )
})