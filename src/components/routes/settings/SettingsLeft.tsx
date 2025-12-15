import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { PROFILE_PATH } from "../../../helpers/constants";
import { AppContext } from "../../App";
import Button from "../../helpers/Button";
import Flex from "../../helpers/Flex";
import HelperDiv from "../../helpers/HelperDiv";
import SideBar from "../../helpers/SideBar";
import { SettingsContext } from "./Settings";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function SettingsLeft({...props}: Props) {

    const { isMobileWidth } = useContext(AppContext);
    const { isSettingsOverlayVisible, setIsSettingsOverlayVisible, isSettingsSideBarVisible, setIsSettingsSideBarVisible } = useContext(SettingsContext);
    
    const componentName = "SettingsLeft";
    const { children, ...otherProps } = getCleanDefaultProps(props, componentName, true);

    const navigate = useNavigate();


    useEffect(() => {
        setIsSettingsOverlayVisible(isSettingsSideBarVisible);

    }, [isSettingsSideBarVisible]);


    useEffect(() => {
        // close on overlay click
        if (!isSettingsOverlayVisible)
            setIsSettingsSideBarVisible(false);

    }, [isSettingsOverlayVisible]);


    function handleProfileClick(): void {

        navigate(PROFILE_PATH);
    }


    return (
        <Flex {...otherProps}>
            {/* Mobile */}
            <SideBar
                className={`${componentName}-mobile`} 
                hidden={!isMobileWidth}
                isVisible={isSettingsSideBarVisible}
                setIsVisible={setIsSettingsSideBarVisible}
                maxWidth="50vw"
                leftAbsolute
            >
                <div className="SideBar-right-content">
                    <Button
                        className={`${componentName}-mobile-button ${window.location.pathname === PROFILE_PATH && "active"}`}
                        onClick={handleProfileClick}
                    >
                        Profile
                    </Button>
                </div>
            </SideBar>

            {/* Table / Desktop */}
            <HelperDiv className={`${componentName}-notMobile`} rendered={!isMobileWidth}>
                <Button 
                    className={`${componentName}-notMobile-button ${window.location.pathname === PROFILE_PATH ? "active" : "hoverStrong"}`}
                    onClick={handleProfileClick}
                >
                    Profile
                </Button>
            </HelperDiv>

            {children}
        </Flex>
    )
}