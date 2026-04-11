import { HTMLAttributeAnchorTarget } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import HelperProps from "../abstract/HelperProps";
import { Oauth2ClientRegistrationId } from "../abstract/Oauth2ClientRegistrationId";
import { OAUTH2_AUTH_LINK_AZURE, OAUTH2_AUTH_LINK_GITHUB, OAUTH2_AUTH_LINK_GOOGLE } from "../helpers/constants";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";


interface Props extends HelperProps {

    iconSrc?: string,
    /** Default is 30 */
    iconHeight?: number,
    clientRegistrationId: Oauth2ClientRegistrationId,
    target?: HTMLAttributeAnchorTarget
}

/**
 * @since 0.0.1
 */
export default function Oauth2LoginButton({
    iconSrc,
    target,
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
            tabIndex={-1}
            {...otherProps}
        >
            <a
                className="Oauth2LoginButton-link blackLink fullWidth"
                href={getLink()}
                target={target}
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
            </a>
        </Button>
    )
}
