import React from "react";
import "../../assets/styles/_404.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function _404({...props}: Props) {

    const componentName = "_404";
    const { children, ...otherProps } = getCleanDefaultProps(props, componentName);

    return (
        <div {...otherProps}>
            <h2 className="_404-heading textCenter mt-5">404</h2>

            <p className="_404-textContent textCenter">We're sorry. The page you're looking for does not exist...</p>

            {children}
        </div>
    )
}