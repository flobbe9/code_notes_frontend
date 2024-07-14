import { CSSProperties, HTMLAttributes, ReactNode } from "react";


/**
 * @since 0.0.1
 */
export default interface DefaultProps extends HTMLAttributes<any> {

    id?: string,
    className?: string,
    children?: ReactNode,
    style?: CSSProperties,
}


/**
 * @param props to clean up
 * @param componentName to prepend to id and className
 * @param componentNameAsId if true, the ```componentName``` will be prepended to id. Default is false
 * @returns clean default props object with componentName prepended to className and optionally to id
 */
export function getCleanDefaultProps(props: DefaultProps, componentName?: string, componentNameAsId = false): DefaultProps {

    componentName = componentName || "";

    let { id, className, children, style, ...otherProps } = props;

    return {
        id: id || componentNameAsId ? componentName + (id || "") : undefined,
        className: (componentName || "") + " " + (className || ""),
        children: children || "",
        style: style || {},
        ...otherProps
    };
}