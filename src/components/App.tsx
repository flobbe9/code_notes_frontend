import React, { createContext, useEffect, useRef, useState } from 'react';
import '../assets/styles/App.scss';
import Toast, { ToastSevirity } from './helpers/Toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getCSSValueAsNumber, isNumberFalsy, isStringFalsy, log, logWarn } from '../helpers/utils';
import NavBar from './NavBar';
import StartPageContainer from './StartPageContainer';
import useKeyPress from '../hooks/useKeyPress';


/**
 * @since 0.0.1
 */
export default function App() {

    const [toastSummary, setToastSummary] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSevirity, setToastSevirity] = useState<ToastSevirity>("info");
    const [toastScreenTimeTimeout, setToastScreenTimeTimeout] = useState<NodeJS.Timeout>();

    const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { isKeyPressed } = useKeyPress();

    /** Time the toast popup takes to slide up and down in ms. */
    const toastSlideDuration = 400;

    const context = {
        toast,
        moveToast,

        windowSize,
        getDeviceWidth,

        isLoggedIn,

        isKeyPressed
    }

    const toastRef = useRef(null);

    
    useEffect(() => {

        window.addEventListener("keydown", handleWindowKeyDown);
        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("keydown", handleWindowKeyDown);
            window.removeEventListener("resize", handleWindowResize);
        }

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
     * Show toast or hide it if ```hideToast``` is ```true```.
     * 
     * @param hideToast if true, toast will definitely by hidden regardless of it's state before. Default is ```false```
     */
    function moveToast(hideToast = false): void {

        const toast = $(toastRef.current!);

        // space between window bottom and toast bottom
        let toastHeight = 30;

        // case: hide
        if (hideToast) 
            // set to negative toast height to make sure it's completely hidden
            toastHeight = -getCSSValueAsNumber(toast.css("height"), 2);

        toast.animate({bottom: toastHeight}, {duration: toastSlideDuration, "easing": "easeOutSine"});
    }
    

    /**
     * Update ```windowSize``` state on ```resize``` event
     */
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

        const windowWidth = windowSize[0];

        return {
            isMobileWidth: windowWidth < 576,
            isTabletWidth:  windowWidth >= 576 && windowWidth < 992,
            isDesktopWidth: windowWidth >= 992,
        }
    }


    function handleWindowKeyDown(event): void {

        const key = event.key;

        if (key === "Escape")
            moveToast(true);
    }


    return (
        <AppContext.Provider value={context}>
            <BrowserRouter>
                <div id="App" className="App">
                    <NavBar />

                    <div className="content">
                        <Routes>
                            <Route path="/" element={<StartPageContainer />} />
                            <Route path="/register" element={<div>Register</div>} />
                            <Route path="/login" element={<div>login</div>} />
                            <Route path="*" element={<div>404</div>} />
                        </Routes>
                    </div>

                    {/* Toast popup */}
                    <Toast 
                        summary={toastSummary}
                        message={toastMessage}
                        sevirity={toastSevirity}
                        ref={toastRef} 
                    />
                </div>
            </BrowserRouter>
        </AppContext.Provider>
    );
}


export const AppContext = createContext({
    toast: (summary: string, message = "", sevirity: ToastSevirity = "info", screenTime?: number) => {},
    moveToast: (hideToast = false, screenTime?: number) => {},

    windowSize: [0, 0],
    getDeviceWidth: () => {return {isMobileWidth: false, isTabletWidth: false,isDesktopWidth: true}},

    isLoggedIn: false,

    isKeyPressed: (keyName: string): boolean => {return false}
});