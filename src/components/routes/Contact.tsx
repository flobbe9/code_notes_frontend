import React from "react";
import "../../assets/styles/Contact.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { LINK_DEFAULT_REL } from "../../helpers/constants";
import Flex from "../helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function Contact({...props}: Props) {

    const { children, ...otherProps } = getCleanDefaultProps(props, "Contact", true);

    return (
        <Flex horizontalAlign="center" {...otherProps}>
            <div className="Contact-container">
                <h2>Contact</h2><br />
            
                <p>
                    Mr. Florin Schikarski <br />
                    Bäckerklint 4 <br />
                    38100 Braunschweig <br />
                    Germany<br /><br />

                    Email: <a href="mailto:support.code-notes@gmail.com" className="blueLink" rel={LINK_DEFAULT_REL}>support.code-notes@gmail.com</a>
                </p>

                {children}
            </div>
        </Flex>
    )
}