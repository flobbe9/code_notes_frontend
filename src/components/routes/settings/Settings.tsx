import React, { createContext, useContext, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import Flex from "../../helpers/Flex";
import SettingsLeft from "./SettingsLeft";
import { AppContext } from "../../App";
import HelperDiv from "../../helpers/HelperDiv";
import Overlay from "../../helpers/Overlay";


interface Props extends DefaultProps {

}


/**
 * Contains the ```<SettingsLeft>``` and renderes ```children``` to it's right, them beeing the actual settings content.
 * 
 * @since 0.0.1
 */
export default function Settings({...props}: Props) {

    const [isSettingsSideBarVisible, setIsSettingsSideBarVisible] = useState(false);
    const [isSettingsOverlayVisible, setIsSettingsOverlayVisible] = useState(false);

    const componentName = "Settings";
    const { children, ...otherProps } = getCleanDefaultProps(props, componentName, true);

    const { isMobileWidth } = useContext(AppContext);

    const context = {
        isSettingsOverlayVisible, setIsSettingsOverlayVisible,
        isSettingsSideBarVisible, setIsSettingsSideBarVisible
    }


    return (
        <SettingsContext.Provider value={context}>
            <Flex {...otherProps}>
                <Flex className={`${componentName}-container defaultPageContent`} flexWrap="nowrap">
                    <Overlay 
                        isOverlayVisible={isSettingsOverlayVisible}
                        setIsOverlayVisible={setIsSettingsOverlayVisible}
                    />
                    
                    <SettingsLeft className="col-md-3" />

                    {/* hr */}
                    <HelperDiv className={`${componentName}-container-pseudoHr col-md-1 mx-5`} rendered={!isMobileWidth}></HelperDiv>

                    {/* Right */}
                    <div className={`${componentName}-container-right col-md-8`}>
                        {children}
                    </div>
                </Flex>
            </Flex>
        </SettingsContext.Provider>
    )
}


export const SettingsContext = createContext({
    isSettingsOverlayVisible: false as boolean, 
    setIsSettingsOverlayVisible: (isVisible: boolean) => {},
    isSettingsSideBarVisible: false as boolean, 
    setIsSettingsSideBarVisible: (isVisible: boolean) => {}
})
