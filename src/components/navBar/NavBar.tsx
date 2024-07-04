import React from "react";
import "../../assets/styles/NavBar.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import Link from "../helpers/CustomLink"
import NavBarProfileSection from "./NavBarProfileSection";


interface Props extends DefaultProps {

}


/**
 * Top nav bar.
 * 
 * @since 0.0.1
 */
export default function NavBar({...otherProps}: Props) {

    const { id, className, style } = getCleanDefaultProps(otherProps, "NavBar", true);

    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
        >
            {/* Left */}
            <Flex className="col-6">
                <Link to="/" className="whiteLink hover" title="Start page">
                    <Flex verticalAlign="center" className="fullHeight">
                        {/* Icon */}
                        <img src="/img/favicon.ico" alt="favicon" className="invertColor" height={45} />

                        {/* Label */}
                        <div className="ms-3" style={{fontSize: "1.2em"}}>
                            <span style={{fontFamily: "var(--codeFont)"}}>Code</span>
                            <span style={{fontFamily: "noteFont"}}> Notes</span>
                        </div>
                    </Flex>
                </Link>
            </Flex>

            {/* Right */}
            <Flex 
                className="col-6"
                horizontalAlign="right" 
                verticalAlign="center"
            >
                <NavBarProfileSection />
            </Flex>
        </Flex>
    )
}