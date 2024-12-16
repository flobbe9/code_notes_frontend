import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import "../assets/styles/Footer.scss";
import { CONTACT_PATH, PRIVACY_POLICY_PATH, VERSION } from "../helpers/constants";
import { setCssConstant } from "../helpers/utils";
import Flex from "./helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function Footer({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Footer", true);

    const componentRef = useRef<HTMLDivElement>(null);

    
    useEffect(() => {
        setCssConstant("footerHeight", componentRef.current!.offsetHeight + "px");

    }, []);


    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            ref={componentRef}
            {...otherProps}
        >
            <Flex className="Footer-leftContainer col-6" verticalAlign="center">
                <Link to={PRIVACY_POLICY_PATH} className="hover simpleLink me-3">Data policy</Link>
                <Link to={CONTACT_PATH} className="hover simpleLink me-3">Contact</Link>
            </Flex>

            <Flex className="Footer-rightContainer col-6" horizontalAlign="right" verticalAlign="center">
                <span className="Footer-rightContainer-version">v {VERSION}</span>
            </Flex>
                
            {children}
        </Flex>
    )
}