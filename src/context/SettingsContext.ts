import { createContext } from "react";

export const SettingsContext = createContext({
    isSettingsOverlayVisible: false as boolean, 
    setIsSettingsOverlayVisible: (_isVisible: boolean) => {},
    isSettingsSideBarVisible: false as boolean, 
    setIsSettingsSideBarVisible: (_isVisible: boolean) => {}
})
