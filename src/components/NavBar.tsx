import $ from "jquery";
import React from "react";
import "./../assets/styles/NavBar.scss";
import DefaultProps, { getCleanDefaultProps } from "./../abstract/DefaultProps";
import Flex from "./helpers/Flex";
import Link from "./helpers/CustomLink"
import NavBarProfileSection from "./NavBarProfileSection";


interface Props extends DefaultProps {

}


/**
 * Top nav bar.
 * 
 * @since 0.0.1
 */
export default function NavBar({...props}: Props) {

    const { id, className, style, ...otherProps } = getCleanDefaultProps(props, "NavBar", true);

    return (
        <Flex 
            id={id} 
            className={className + " p-3"}
            style={style}
            {...otherProps}
        >
            {/* Left */}
            <Flex className="col-6">
                <Link to="/" className="whiteLink hover" title="Start page">
                    <Flex verticalAlign="center" className="fullHeight dontSelectText">
                        {/* Icon */}
                        <img src="/img/favicon.ico" alt="favicon" className="invertColor" height={45} />

                        {/* Label */}
                        <div className="ms-3 iconLabel">
                            <span><code>Code</code></span>
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