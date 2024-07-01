import React from "react";
import "../../assets/styles/NavBar.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "../helpers/Flex";
import CodeNotesIcon from "../CodeNotesIcon";
import Link from "../helpers/CustomLink"
import CodeNotesLabel from "../CodeNotesLabel";
import NavBarProfileSection from "./NavBarProfileSection";


interface Props extends DefaultProps {

}


/**
 * Top nav bar.
 * 
 * @since 0.0.1
 */
// TODO: mobile
export default function NavBar({...otherProps}: Props) {

    const { id, className, style } = getCleanDefaultProps(otherProps, "NavBar", true);

    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
        >
            {/* Left */}
            <Flex className="col-4">
                <Link to="/" className="whiteLink hover" title="Start page">
                    <Flex verticalAlign="center" className="fullHeight">
                        <CodeNotesIcon />
                        <CodeNotesLabel className="ms-5" />
                    </Flex>
                </Link>
            </Flex>

            {/* Center */}
            <Flex className="col-4"></Flex>

            {/* Right */}
            <Flex 
                className="col-4 pe-1"
                horizontalAlign="right" 
                verticalAlign="center"
            >
                <NavBarProfileSection />
            </Flex>
        </Flex>
    )
}