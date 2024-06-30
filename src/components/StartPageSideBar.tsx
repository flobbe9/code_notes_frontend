import React from "react";
import "../assets/styles/StartPageSideBar.css";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Flex from "./helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function StartPageSideBar({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "StartPageSideBar", true);

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >

            <div>
                Start page side bar
            </div>
                
            {children}
        </div>
    )
}