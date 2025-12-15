import React from "react";
import DefaultProps, { getCleanDefaultProps } from "./../abstract/DefaultProps";
import Flex from "./helpers/Flex";
import NavBarProfileSection from "./NavBarProfileSection";
import { Link } from "react-router-dom";


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
                        <h1 className="ms-3 iconLabel">
                            <span><code>Code</code></span>
                            <span style={{fontFamily: "noteFont"}}> Notes</span>
                        </h1>
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
