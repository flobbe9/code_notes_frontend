import { AppContext } from "@/context/AppContext";
import { SettingsContext } from "@/context/SettingsContext";
import { useContext, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import Flex from "../../helpers/Flex";
import HelperDiv from "../../helpers/HelperDiv";
import Overlay from "../../helpers/Overlay";
import SettingsLeft from "./SettingsLeft";


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
                    <HelperDiv className={`${componentName}-container-pseudoHr mx-5`} rendered={!isMobileWidth}>&nbsp;</HelperDiv>

                    {/* Right */}
                    <div className={`${componentName}-container-right col-md-8`}>
                        {children}
                    </div>
                </Flex>
            </Flex>
        </SettingsContext.Provider>
    )
}
