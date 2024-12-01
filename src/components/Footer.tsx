import $ from "jquery";
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import "../assets/styles/Footer.scss";
import { ABOUT_PATH, DATA_POLICY_PATH, VERSION } from "../helpers/constants";
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
        setCssConstant("footerHeight", getFooterHeight());

    }, []);


    function getFooterHeight(): string {

        return ($(componentRef.current!).outerHeight()?.toString() || "0") + "px";
    }

    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            ref={componentRef}
            {...otherProps}
        >
            <Flex className="Footer-leftContainer col-6" verticalAlign="center">
                {/* Data Policy */}
                <Link to={DATA_POLICY_PATH} className="hover simpleLink me-3">Data policy</Link>

                {/* About */}
                <Link to={ABOUT_PATH} className="hover simpleLink me-3">About</Link>
            </Flex>

            <Flex className="Footer-rightContainer col-6" horizontalAlign="right" verticalAlign="center">
                {/* Version */}
                <span className="Footer-rightContainer-version">Version {VERSION}</span>
            </Flex>
                
            {children}
        </Flex>
    )
}