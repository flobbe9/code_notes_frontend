import React from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { Link } from "react-router-dom";
import { LINK_DEFAULT_REL } from "../../helpers/constants";
import { LinkTarget } from "../../abstract/CSSTypes";
import HelperProps from "../../abstract/HelperProps";


interface Props extends HelperProps {
    /** Url to navigate to. If not absolute, this will be interpreted as path. */
    to: string,
    /** Default is "" */
    rel?: string,
    /** Default is "_self" */
    target?: LinkTarget
}


/**
 * Component defining a standard react ```<Link>``` but with a rel of {@link LINK_DEFAULT_REL}.
 * 
 * @since 0.0.1
 */
export default function CustomLink(
    {
        to, 
        title = "", 
        rel = "", 
        target = "_self", 
        rendered = true,
        onClick,
        ...otherProps
    }: Props
) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "CustomLink");

    return (
        <Link 
            to={to}
            id={id} 
            className={className}
            style={style}
            rel={LINK_DEFAULT_REL + " " + rel}
            title={title}
            target={target}
            onClick={onClick}
            hidden={!rendered}
        >
            {children}
        </Link>
    )
}