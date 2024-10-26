import React from "react";
import "../assets/styles/Oauth2LoginButton.scss";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import HelperProps from "../abstract/HelperProps";
import Button from "./helpers/Button";
import { Link } from "react-router-dom";
import { OAUTH2_AUTH_LINK_AZURE, OAUTH2_AUTH_LINK_GITHUB, OAUTH2_AUTH_LINK_GOOGLE } from "../helpers/constants";
import Flex from "./helpers/Flex";
import { Oauth2ClientRegistrationId } from "../abstract/Oauth2ClientRegistrationId";


interface Props extends HelperProps {

    iconSrc?: string,
    /** Default is 30 */
    iconHeight?: number,
    clientRegistrationId: Oauth2ClientRegistrationId
}


/**
 * @since 0.0.1
 */
export default function Oauth2LoginButton({
    iconSrc,
    iconHeight = 30,
    clientRegistrationId,
    ...props
}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Oauth2LoginButton");

    function getLink(): string {

        switch (clientRegistrationId) {
            case "google": 
                return OAUTH2_AUTH_LINK_GOOGLE;

            case "azure":
                return OAUTH2_AUTH_LINK_AZURE;

            case "github": 
                return OAUTH2_AUTH_LINK_GITHUB;
        }
    }

    return (
        <Button 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            <Link
                className="Oauth2LoginButton-link blackLink fullWidth"
                to={getLink()}
                tabIndex={-1}
            >
                <Flex flexWrap="nowrap" verticalAlign="center">
                    <img 
                        className="Oauth2LoginButton-link-icon"
                        src={iconSrc} 
                        alt={clientRegistrationId} 
                        height={iconHeight}
                    />
                    <span className="fullWidth">{children}</span>
                </Flex>
            </Link>
        </Button>
    )
}