import React from "react";
import "../assets/styles/NavBar.css";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Flex from "./helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * Top nav bar.
 * 
 * @since 0.0.1
 */
export default function NavBar({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "NavBar", true);

    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >

            <Flex>
                This is the nav bar
            </Flex>
                
            {children}
        </div>
    )
}