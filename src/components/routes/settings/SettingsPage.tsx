import React from "react";
import "../../../assets/styles/SettingsPage.scss";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import Flex from "../../helpers/Flex";
import SettingsSideBar from "./SettingsSideBar";


interface Props extends DefaultProps {

}


/**
 * Contains the ```<SettingsSideBar>``` and renderes ```children``` to it's right, them beeing the actual settings content.
 * 
 * @since 0.0.1
 */
export default function SettingsPage({...props}: Props) {

    const { children, ...otherProps } = getCleanDefaultProps(props, "SettingsPage", true);


    return (
        <Flex horizontalAlign="center" {...otherProps}>
            <Flex className="SettingsPage-container defaultPageContent">
                <SettingsSideBar className="col-3" />

                <div className="SettingsPage-container-settingsContent col-9">
                    {children}
                </div>
            </Flex>
        </Flex>
    )
}