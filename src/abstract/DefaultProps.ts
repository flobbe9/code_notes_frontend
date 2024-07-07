import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { log } from "../helpers/utils";


/**
 * @since 0.0.1
 */
export default interface DefaultProps {

    id?: string,
    className?: string,
    children?: ReactNode,
    style?: CSSProperties,
    /** Any other html attribute */
    other?: HTMLAttributes<any>
}


/**
 * @param props to clean up
 * @param componentName to prepend to id and className
 * @param componentNameAsId if true, the ```componentName``` will be prepended to id. Default is false
 * @returns clean default props object with componentName prepended to className and optionally to id
 */
export function getCleanDefaultProps(props: DefaultProps, componentName?: string, componentNameAsId = false): DefaultProps {

    componentName = componentName || "";

    return {
        id: props.id || componentNameAsId ? componentName + (props.id || "") : undefined,
        className: (componentName || "") + " " + (props.className || ""),
        children: props.children || "",
        style: props.style || {},
        other: props.other || {}
    }
}