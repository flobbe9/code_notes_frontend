import $ from "jquery";
import React, { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '../assets/styles/App.scss';
import { CONTACT_PATH, LOGIN_PATH, PRIVACY_POLICY_PATH, REGISTER_PATH, RESET_PASSWORD_BY_TOKEN_PATH, RESET_PASSWORD_PATH, START_PAGE_PATH } from "../helpers/constants";
import { getCssConstant, getCSSValueAsNumber, isNumberFalsy } from '../helpers/utils';
import useKeyPress from '../hooks/useKeyPress';
import AppFetchContextHolder from "./AppFetchContextHolder";
import Footer from "./Footer";
import SpinnerIcon from "./helpers/icons/SpinnerIcon";
import LoggedInComponent from "./helpers/LoggedInComponent";
import LoggedOutComponent from "./helpers/LoggedOutComponent";
import Overlay from './helpers/Overlay';
import Popup from './helpers/Popup';
import Toast, { ToastSevirity } from './helpers/Toast';
import Login from "./Login";
import NavBar from './NavBar';
import Register from "./Register";
import ResetPassword from "./ResetPassword";
import RouteContext from "./RouteContext";
import StartPageContainer from './StartPageContainer';
import PrivacyPolicy from "./PrivacyPolicy";
import Contact from "./Contact";


/**
 * @since 0.0.1
 */
export default function App() {

    const [toastSummary, setToastSummary] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSevirity, setToastSevirity] = useState<ToastSevirity>("info");
    const [toastScreenTimeTimeout, setToastScreenTimeTimeout] = useState<NodeJS.Timeout>();
    
    const [isAppOverlayVisible, setIsAppOverlayVisible] = useState(false);
    const [appOverlayContent, setAppOverlayContent] = useState<JSX.Element | JSX.Element[]>(<></>);
    const [isAppOverlayHideOnClick, setIsAppOverlayHideOnClick] = useState(true);
    const [isAppOverlayHideOnEscape, setIsAppOverlayHideOnEscape] = useState(true);
    
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupContent, setPopupContent] = useState<ReactNode>([]);
    const [isPopup2Visible, setIsPopup2Visible] = useState(false);
    const [popup2Content, setPopup2Content] = useState<ReactNode>([]);
    
    const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

    /** Whether to prompt confirm on logout click, e.g. because there are unsaved changes */
    const [hasAnyNoteBeenEdited, setHasAnyNoteBeenEdited] = useState(false);

    const { isKeyPressed, isControlKeyPressed, handleKeyDownUseKeyPress, handleKeyUpUseKeyPress } = useKeyPress();

    /** Time the toast popup takes to slide up and down in ms. */
    const toastSlideDuration = 400;

    const context = {
        toast,
        moveToast,

        windowSize,
        isMobileWidth: getDeviceWidth().isMobileWidth,
        isTableWidth: getDeviceWidth().isTabletWidth,
        isDesktopWidth: getDeviceWidth().isDesktopWidth,

        isKeyPressed,
        isControlKeyPressed,

        isAppOverlayVisible,
        setIsAppOverlayVisible,
        isAppOverlayHideOnClick,
        setIsAppOverlayHideOnClick,
        setIsAppOverlayHideOnEscape,
        setAppOverlayContent,
        showPendingOverlay,
        hidePendingOverlay,

        showPopup,
        hidePopup,
        replacePopupContent,

        hasAnyNoteBeenEdited, setHasAnyNoteBeenEdited
    }

    const toastRef = useRef(null);

    
    useEffect(() => {
        window.addEventListener("keydown", handleWindowKeyDown);
        window.addEventListener("keyup", handleWindowKeyUp);
        window.addEventListener("resize", handleWindowResize);

    }, []);


    /**
     * Set given text to toast and call ```toggle()``` on it.
     * 
     * @param summary serves like a small heading
     * @param message to display in tost body
     * @param sevirity will define the toast style. See {@link ToastSevirity}
     * @param screenTime time in ms that the popup should stay visible before hiding again automatically. If omitted, 
     *                   the popup wont hide by itself.
     */
    function toast(summary: string, message = "", sevirity: ToastSevirity = "info", screenTime?: number): void {

        setToastSummary(summary);
        setToastMessage(message);
        setToastSevirity(sevirity);

        // case: hide automatically
        if (!isNumberFalsy(screenTime)) {
            // stop toast animation
            clearTimeout(toastScreenTimeTimeout);
            $(toastRef.current!).stop();

            // restart toast animation
            const toastTimeout = setTimeout(() => moveToast(true), screenTime);
            setToastScreenTimeTimeout(toastTimeout);
        }

        setTimeout(() => {
            moveToast();
        }, 10)
    }


    /**
     * Show toast or hide it if ```hideToast``` is ```true```. Has a 100 milliseconds delay.
     * 
     * @param hideToast if true, toast will definitely by hidden regardless of it's state before. Default is ```false```
     */
    async function moveToast(hideToast = false): Promise<void> {

        const toast = $(toastRef.current!);

        // space between toast and window bottom
        let targetBottom = 30;

        // toast height with message
        const currentToastHeight = getCSSValueAsNumber(toast.css("height"), 2);

        // case: hide
        if (hideToast) 
            // make sure toast is completely hidden
            targetBottom = -currentToastHeight;

        // case: show
        else 
            // move toast back to start pos
            toast.css("bottom", -currentToastHeight);

        // wait for css to complete
        setTimeout(() => 
            toast.animate({bottom: targetBottom}, {duration: toastSlideDuration, easing: "easeOutSine"}), 100);
    }
    

    function handleWindowResize(event): void {

        setWindowSize([window.innerWidth, window.innerHeight]);
    }
    

    /**
     * Col grid:
     * 
     * mobile: ```col-, col-sm-```,
     * 
     * tablet: ```col-md, col-lg```,
     * 
     * desktop: ```col-lg-, col-xl-, col-xxl-```
     * 
     * @returns object with 3 modes of which only one is true
     * @see https://getbootstrap.com/docs/5.3/layout/grid/
     */
    function getDeviceWidth(): {
        isMobileWidth: boolean
        isTabletWidth: boolean
        isDesktopWidth: boolean
    } {

        const windowWidth = window.innerWidth;

        const mobileMaxWidth = getCSSValueAsNumber(getCssConstant("mobileMaxWidth"), 2);
        const tabletMinWidth = getCSSValueAsNumber(getCssConstant("tabletMinWidth"), 2);
        const tabletMaxWidth = getCSSValueAsNumber(getCssConstant("tabletMaxWidth"), 2);
        const desktopMinWidth = getCSSValueAsNumber(getCssConstant("desktopMinWidth"), 2);

        return {
            isMobileWidth: windowWidth <= mobileMaxWidth,
            isTabletWidth:  windowWidth >= tabletMinWidth && windowWidth <= tabletMaxWidth,
            isDesktopWidth: windowWidth >= desktopMinWidth,
        }
    }


    function handleWindowKeyDown(event): void {

        const key = event.key;

        handleKeyDownUseKeyPress(event);

        if (key === "Escape") {
            moveToast(true);
            hidePopup();
        }
    }


    function handleWindowKeyUp(event): void {

        handleKeyUpUseKeyPress(event);
    }


    /**
     * Displays the app overlay with a pending icon and makes it non-escapable.
     * 
     * @param overlayContent the content to put below the pending icon
     */
    function showPendingOverlay(overlayContent?: ReactNode): void {

        setIsAppOverlayVisible(true);
        setAppOverlayContent(
            <>
                <SpinnerIcon size="2em" style={{color: "var(--accentColor)"}} />
                {overlayContent}
            </>
        )
        setIsAppOverlayHideOnClick(false);
        setIsAppOverlayHideOnEscape(false);
    }


    /**
     * Hides the app overlay and resets all overlay states to default.
     */
    function hidePendingOverlay(): void {

        setIsAppOverlayVisible(false);
        setAppOverlayContent(<></>);
        setIsAppOverlayHideOnClick(true);
        setIsAppOverlayHideOnEscape(true);
    }


    /**
     * Show topmost visible popup and possibly set content. Hide app overlay.
     * 
     * @param popupContent will only update state if this is not ```undefined```
     */
    function showPopup(popupContent?: ReactNode): void {

        const { setIsPopupVisible, setPopupContent, isBottomMostPopup } = getPopupAfterTopMostVisiblePopup();

        if (popupContent !== undefined)
            setPopupContent(popupContent);

        setIsPopupVisible(true);
        setIsAppOverlayVisible(true);
        if (isBottomMostPopup)
            setIsAppOverlayHideOnEscape(false);
    }


    /**
     * Hide topmost visible popup and app overlay.
     */
    function hidePopup(): void {

        const { setIsPopupVisible, isBottomMostPopup } = getTopMostVisiblePopup();

        setIsPopupVisible(false);

        if (isBottomMostPopup) {
            setIsAppOverlayVisible(false);
            setIsAppOverlayHideOnEscape(true);
        }
    }


    /**
     * Update the popup content of the top most visible popup
     * @param content 
     */
    function replacePopupContent(content: ReactNode): void {

        const { setPopupContent } = getTopMostVisiblePopup();

        setPopupContent(content);
    }


    /**
     * @returns all states of the ```<Popup>``` that rendered last and visible
     */
    function getTopMostVisiblePopup(): { 
        popupContent: ReactNode,
        setPopupContent: (content: ReactNode) => void,
        isPopupVisible: boolean,
        setIsPopupVisible: (isVisible: boolean) => void,
        isBottomMostPopup: boolean
    } {

        // case: popup2 is visible
        if (document.querySelector("#Popup2")?.computedStyleMap().get("display")?.toString() !== "none")
            return { 
                popupContent: popup2Content,
                setPopupContent: setPopup2Content,
                isPopupVisible: isPopup2Visible,
                setIsPopupVisible: setIsPopup2Visible,
                isBottomMostPopup: false
            };

        return {
            popupContent,
            setPopupContent,
            isPopupVisible,
            setIsPopupVisible,
            isBottomMostPopup: true
        };
    }
    

    /**
     * @returns all states of the ```<Popup>``` after the topMost visible popup
     */
    function getPopupAfterTopMostVisiblePopup(): { 
        popupContent: ReactNode,
        setPopupContent: (content: ReactNode) => void,
        isPopupVisible: boolean,
        setIsPopupVisible: (isVisible: boolean) => void,
        isBottomMostPopup: boolean
    } {

        // case: popup 1 is visible
        if (document.querySelector("#Popup1")?.computedStyleMap().get("display")?.toString() === "none")
            return {
                popupContent,
                setPopupContent,
                isPopupVisible,
                setIsPopupVisible,
                isBottomMostPopup: true
            };
        
        return { 
            popupContent: popup2Content,
            setPopupContent: setPopup2Content,
            isPopupVisible: isPopup2Visible,
            setIsPopupVisible: setIsPopup2Visible,
            isBottomMostPopup: false
        };
    }
    

    return (
        <AppContext.Provider value={context}>
            <BrowserRouter>
                <RouteContext>
                    <AppFetchContextHolder>
                        <div id="App" className="App">
                            <Overlay 
                                id="App"
                                isOverlayVisible={isAppOverlayVisible} 
                                setIsOverlayVisible={setIsAppOverlayVisible} 
                                hideOnClick={isAppOverlayHideOnClick}
                                hideOnEscape={isAppOverlayHideOnEscape}
                                fitParent={false}
                            >
                                {appOverlayContent}
                            </Overlay>

                            <Popup 
                                id="1"
                                isPopupVisible={isPopupVisible} 
                                popupContent={popupContent}
                                setPopupContent={setPopupContent}
                            />
                            <Popup
                                id="2" 
                                isPopupVisible={isPopup2Visible} 
                                popupContent={popup2Content}
                                setPopupContent={setPopup2Content}
                             />

                            <NavBar />

                            <div className="content">
                                <Routes>
                                    <Route path={START_PAGE_PATH} element={<StartPageContainer />} />
                                    <Route path={REGISTER_PATH} element={<Register />} />
                                    <Route path={LOGIN_PATH} element={<LoggedOutComponent element={<Login />} />} />
                                    <Route path={RESET_PASSWORD_PATH} element={<LoggedInComponent element={<ResetPassword />} />} />
                                    <Route path={RESET_PASSWORD_BY_TOKEN_PATH} element={<ResetPassword />} />
                                    <Route path={PRIVACY_POLICY_PATH} element={<PrivacyPolicy />} />
                                    <Route path={CONTACT_PATH} element={<Contact />} />
                                    <Route path="*" element={<div>404</div>} />
                                </Routes>
                            </div>

                            <Footer />

                            {/* Toast popup */}
                            <Toast 
                                summary={toastSummary}
                                message={toastMessage}
                                sevirity={toastSevirity}
                                ref={toastRef} 
                            />  
                        </div>
                    </AppFetchContextHolder>
                </RouteContext>
            </BrowserRouter>
        </AppContext.Provider>
    );
}


export const AppContext = createContext({
    toast: (summary: string, message = "", sevirity: ToastSevirity = "info", screenTime?: number) => {},
    moveToast: (hideToast = false, screenTime?: number) => {},

    windowSize: [0, 0],
    isMobileWidth: false as boolean,
    isTableWidth: false as boolean,
    isDesktopWidth: false as boolean,

    isKeyPressed: (keyName: string): boolean => {return false},
    isControlKeyPressed: () => {return false as boolean},

    isAppOverlayVisible: false,
    setIsAppOverlayVisible: (isVisible: boolean) => {},
    isAppOverlayHideOnClick: true,
    setIsAppOverlayHideOnClick: (isHideOnClick: boolean) => {},
    setIsAppOverlayHideOnEscape: (isHideOnEscape: boolean) => {},
    setAppOverlayContent: (overlayContent: JSX.Element | JSX.Element[]) => {},
    showPendingOverlay: (overlayContent?: ReactNode) => {},
    hidePendingOverlay: () => {},

    showPopup: (popupContent?: ReactNode) => {},
    hidePopup: () => {},
    replacePopupContent: (content: ReactNode) => {},

    hasAnyNoteBeenEdited: false as boolean, 
    setHasAnyNoteBeenEdited: (isConfirm: boolean) => {}
});