import { createContext, JSX, ReactNode } from "react";
import { ToastSevirity } from "./helpers/Toast";


export const AppContext = createContext({
    toast: (_summary: string, _message = "", _sevirity: ToastSevirity = "info", _screenTime?: number) => {},
    forceToastTimeout: (_screentTime?: number) => {},
    moveToast: (_hideToast = false, _screenTime?: number) => {},

    windowSize: [0, 0],
    isMobileWidth: false as boolean,
    isTableWidth: false as boolean,
    isDesktopWidth: false as boolean,

    isKeyPressed: (_keyName: string): boolean => {return false},
    isControlKeyPressed: (_nonControlKeys?: string[]) => {return false as boolean},
    pressedKeys: new Set() as Set<string>,

    isAppOverlayVisible: false,
    setIsAppOverlayVisible: (_isVisible: boolean) => {},
    isAppOverlayHideOnClick: true,
    setIsAppOverlayHideOnClick: (_isHideOnClick: boolean) => {},
    setIsAppOverlayHideOnEscape: (_isHideOnEscape: boolean) => {},
    setAppOverlayContent: (_overlayContent: JSX.Element | JSX.Element[]) => {},
    showPendingOverlay: (_overlayContent?: ReactNode) => {},
    hidePendingOverlay: () => {},

    showPopup: (_popupContent?: ReactNode | undefined) => {},
    hidePopup: () => {},
    replacePopupContent: (_content: ReactNode | undefined) => {},
});
