import $ from "jquery";
import React, { createContext, useEffect, useRef, useState } from 'react';
import '../assets/styles/App.scss';
import Toast, { ToastSevirity } from './helpers/Toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getCSSValueAsNumber, isNumberFalsy, log } from '../helpers/utils';
import NavBar from './NavBar';
import StartPageContainer from './StartPageContainer';
import useKeyPress from '../hooks/useKeyPress';
import Overlay from './helpers/Overlay';
import { AppUserEntity } from '../abstract/entites/AppUserEntity';
import { AppUserRole } from '../abstract/AppUserRole';
import { NoteInputType } from '../abstract/NoteInputType';
import Popup from './helpers/Popup';
import Login from "./Login";
import { useAppUser } from "../hooks/useAppUser";
import { useLoggedIn } from "../hooks/useLoggedIn";
import FetchAppUser from "./FetchAppUser";
import FetchLoggedIn from "./FetchLoggedIn";


/**
 * @since 0.0.1
 */
// IDEA: 
    // drag and drop noteInputs
// TODO: 
    // pending while fetching
        // app user null or login null
        // remove global overlay (?)
    // finish other auth hooks
    // app user service
        // save
        // delete
        // logout
            // clear query cache
            // remove csrf token
            // set app user null
            // set logged in false
    // logout method for states in App.tsx
    // bug: add new note
        // move instance methods to service class
        // continue here
export default function App() {

    const [appUserEntity, setAppUserEntity] = useState<AppUserEntity | null>(null);
    
    const [toastSummary, setToastSummary] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSevirity, setToastSevirity] = useState<ToastSevirity>("info");
    const [toastScreenTimeTimeout, setToastScreenTimeTimeout] = useState<NodeJS.Timeout>();
    
    const [isAppOverlayVisible, setIsAppOverlayVisible] = useState(false);
    const [appOverlayContent, setAppOverlayContent] = useState<JSX.Element | JSX.Element[]>(<></>);
    const [isAppOverlayHideOnClick, setIsAppOverlayHideOnClick] = useState(true);
    const [isAppOverlayHideOnEscape, setIsAppOverlayHideOnEscape] = useState(true);
    
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupContent, setPopupContent] = useState<JSX.Element | JSX.Element[]>([]);
    
    const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

    const [hasAppRendered, setHasAppRendered] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { isKeyPressed, isControlKeyPressed, handleKeyDownUseKeyPress, handleKeyUpUseKeyPress } = useKeyPress();

    /** Time the toast popup takes to slide up and down in ms. */
    const toastSlideDuration = 400;

    const context = {
        appUserEntity,
        setAppUserEntity, 

        toast,
        moveToast,

        windowSize,
        getDeviceWidth,

        isLoggedIn,
        setIsLoggedIn,

        isKeyPressed,
        isControlKeyPressed,

        isAppOverlayVisible,
        setIsAppOverlayVisible,
        isAppOverlayHideOnClick,
        setIsAppOverlayHideOnClick,
        setIsAppOverlayHideOnEscape,
        setAppOverlayContent,

        isPopupVisible, 
        setIsPopupVisible,
        popupContent, 
        setPopupContent
    }

    const toastRef = useRef(null);

    
    useEffect(() => {
        setHasAppRendered(true);

        window.addEventListener("keydown", handleWindowKeyDown);
        window.addEventListener("keyup", handleWindowKeyUp);
        window.addEventListener("resize", handleWindowResize);

    }, []);


    useEffect(() => {
        if (hasAppRendered) 
            setIsPopupVisible(true);

    }, [popupContent]);


    useEffect(() => {
        if (appUserEntity === null && isLoggedIn) 
            setTimeout(() => showPendingOverlay(), 500);
        else
            setTimeout(() => hidePendingOverlay(), 500);

    }, [appUserEntity]);


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

        handleKeyDownUseKeyPress(event);

        if (key === "Escape")
            moveToast(true);
    }


    function handleWindowKeyUp(event): void {

        handleKeyUpUseKeyPress(event);
    }


    function showPendingOverlay(): void {

        setIsAppOverlayVisible(true);
        setAppOverlayContent(
            <i className="fa-solid fa-circle-notch rotating" style={{fontSize: "2em"}}></i>
        )
        setIsAppOverlayHideOnClick(false);
        setIsAppOverlayHideOnEscape(false);
    }


    function hidePendingOverlay(): void {

        setIsAppOverlayVisible(false);
        setAppOverlayContent(<></>);
        setIsAppOverlayHideOnClick(true);
        setIsAppOverlayHideOnEscape(true);
    }
    

    return (
        <AppContext.Provider value={context}>
            <BrowserRouter>
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

                    <Popup />

                    {/* Fetch data on render */}
                    <FetchLoggedIn />
                    { isLoggedIn && <FetchAppUser />}

                    <NavBar />

                    <div className="content">
                        <Routes>
                            <Route path="/" element={<StartPageContainer />} />
                            <Route path="/register" element={<div>Register</div>} />
                            <Route path="/login" element={<Login />} />
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
    appUserEntity: AppUserEntity.getDefaultInstance() as AppUserEntity | null,
    setAppUserEntity: (appUserEntity: AppUserEntity | null) => {},

    toast: (summary: string, message = "", sevirity: ToastSevirity = "info", screenTime?: number) => {},
    moveToast: (hideToast = false, screenTime?: number) => {},

    windowSize: [0, 0],
    getDeviceWidth: () => {return {isMobileWidth: false, isTabletWidth: false,isDesktopWidth: true}},

    isLoggedIn: false,
    setIsLoggedIn: (isLoggedIn: boolean) => {},

    isKeyPressed: (keyName: string): boolean => {return false},
    isControlKeyPressed: () => {return false as boolean},

    isAppOverlayVisible: false,
    setIsAppOverlayVisible: (isVisible: boolean) => {},
    isAppOverlayHideOnClick: true,
    setIsAppOverlayHideOnClick: (isHideOnClick: boolean) => {},
    setIsAppOverlayHideOnEscape: (isHideOnEscape: boolean) => {},
    setAppOverlayContent: (overlayContent: JSX.Element | JSX.Element[]) => {},

    isPopupVisible: false, 
    setIsPopupVisible: (isVisible: boolean) => {},
    popupContent: <></> as (JSX.Element | JSX.Element[]), 
    setPopupContent: (content: JSX.Element | JSX.Element[]) => {}
});


// TODO: remove in prod
const mockAppUserEntity: AppUserEntity = new AppUserEntity(
    3,
    "2024-09-15 22:21:22.22222",
    "2024-09-15 22:21:22.22222",
    "user@user.com",
    "$2a$10$PDzuJ0g.FZMEDyXJq70qMuKSCSsS56wilmo5iuzxVFD/LCiMG5/.i", // Abc123,.
    AppUserRole.USER,
    [
        { name: "tag14" },
        { name: "docker" },
        { name: "linux" },
        { name: "other stuff" }
    ],
    [
      {
        id: 20,
        title: "bash into",
        noteInputs: [
            {
                value: "const x = 3;\n\nadsf\nasdf",
                type: NoteInputType.CODE,
                programmingLanguage: "Java"
            },
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            },
        ],
        tags: [
            {
                name: "other stuff"
            }
        ]
      },
      {
        id: 19,
        title: "note19",
        noteInputs: [
            {
                value: "some <code>code</code>",
                type: NoteInputType.PLAIN_TEXT
            },
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            },
        ],
        tags: [
            {
                name: "docker"
            },
            {
                name: "linux"
            }
        ]
      },
      {
        id: 18,
        title: "win bash",
        noteInputs: [
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto",
            },
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            }
        ],
        tags: [
            {
                name: "tag14",
            }
        ]
      }
    ]
)