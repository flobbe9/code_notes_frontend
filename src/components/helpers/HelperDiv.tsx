import { forwardRef, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import HelperProps from "../../abstract/HelperProps";
import { AppContext } from "@/context/AppContext";


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
        onRender,
        onClick,
        disabled = false,
        rendered = true,
        _hover = {},
        ...props
    }: Props,
    ref: Ref<HTMLDivElement>
) {
    const [isHover, setIsHover] = useState(false);
    
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props);

    const componentRef = useRef<HTMLDivElement>(null);
    const {} = useContext(AppContext)


    // make "ref" usable inside this component
    useImperativeHandle(ref, () => componentRef.current!, []);


    useEffect(() => {
        if (onRender)
            onRender();

        toggleIsHover();
        
    }, []);


    function toggleIsHover(): void {
        const component = componentRef.current!;

        component.addEventListener("mouseenter", () => setIsHover(true));
        component.addEventListener("mouseleave", () => setIsHover(false));
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
            className={className + (rendered ? "" : " hidden")}
            style={{
                ...style,
                ...(isHover && !disabled ? _hover : {}),
            }}
            ref={componentRef}
            title={title}
            onClick={handleClick}
            contentEditable={otherProps.contentEditable}
            {...otherProps}
        >
            {children}
        </div>
    )
})