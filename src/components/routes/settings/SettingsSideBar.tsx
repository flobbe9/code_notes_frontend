import React from "react";
import { useNavigate } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import "../../../assets/styles/SettingsSideBar.scss";
import { PROFILE_PATH } from "../../../helpers/constants";
import Button from "../../helpers/Button";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function SettingsSideBar({...props}: Props) {

    const { children, ...otherProps } = getCleanDefaultProps(props, "SettingsSideBar", true);

    const navigate = useNavigate();


    return (
        <div {...otherProps}>
            <Button 
                className={`SettingsSideBar-button ${window.location.pathname === PROFILE_PATH ? "active" : "hoverStrong"}`}
                onClick={() => navigate(PROFILE_PATH)}
            >
                Profile
            </Button>

            <Button 
                className={`SettingsSideBar-button ${window.location.pathname === "/settings/totp" ? "active" : "hoverStrong"}`}
                onClick={() => navigate("/settings/totp")}
            >
                TOTP
            </Button>

            <Button 
                className={`SettingsSideBar-button ${window.location.pathname === "/settings/other" ? "active" : "hoverStrong"}`}
                onClick={() => navigate("/settings/other")}
            >
                Other
            </Button>

            {children}
        </div>
    )
}