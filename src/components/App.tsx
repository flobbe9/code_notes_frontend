import React, { createContext, useEffect, useRef, useState } from 'react';
import '../assets/styles/App.scss';
import Toast, { ToastSevirity } from './helpers/Toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getCSSValueAsNumber, isNumberFalsy, isStringFalsy, log, logWarn, stringToNumber } from '../helpers/utils';
import NavBar from './NavBar';
import StartPageContainer from './StartPageContainer';
import useKeyPress from '../hooks/useKeyPress';
import Overlay from './helpers/Overlay';
import { AppUserEntity } from '../abstract/entites/AppUserEntityEntity';
import { AppUserRole } from '../abstract/AppUserRole';
import { NoteInputEntityType } from '../abstract/NoteInputEntityType';
import { Tag } from '../abstract/entites/TagEntity';


/**
 * @since 0.0.1
 */
// IDEA: consider changing the component names
// TODO:
    // search
    // replace parsing states with checkbox states
export default function App() {

    const [appUserEntity, setAppUserEntity] = useState<AppUserEntity>(mockAppUserEntity);

    const [toastSummary, setToastSummary] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSevirity, setToastSevirity] = useState<ToastSevirity>("info");
    const [toastScreenTimeTimeout, setToastScreenTimeTimeout] = useState<NodeJS.Timeout>();

    const [isAppOverlayVisible, setIsAppOverlayVisible] = useState(false);

    const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { isKeyPressed, isControlKeyPressed } = useKeyPress();

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

        isKeyPressed,
        isControlKeyPressed,

        toggleAppOverlay,
        isAppOverlayVisible,
        getAppOverlayZIndex
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

        if (key === "Escape")
            moveToast(true);
    }


    function toggleAppOverlay(): void {

        setIsAppOverlayVisible(!isAppOverlayVisible);
    }
    

    function getAppOverlayZIndex(): number {

        const appOverlay = $("#OverlayApp");

        return stringToNumber(appOverlay.css("zIndex"));
    }


    return (
        <AppContext.Provider value={context}>
            <BrowserRouter>
                <div id="App" className="App">
                    <Overlay 
                        id="App"
                        isOverlayVisible={isAppOverlayVisible} 
                        setIsOverlayVisible={setIsAppOverlayVisible} 
                        fitParent={false}
                    />

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
    appUserEntity: AppUserEntity.getDefaultInstance(),
    setAppUserEntity: (appUserEntity: AppUserEntity) => {},

    toast: (summary: string, message = "", sevirity: ToastSevirity = "info", screenTime?: number) => {},
    moveToast: (hideToast = false, screenTime?: number) => {},

    windowSize: [0, 0],
    getDeviceWidth: () => {return {isMobileWidth: false, isTabletWidth: false,isDesktopWidth: true}},

    isLoggedIn: false,

    isKeyPressed: (keyName: string): boolean => {return false},
    isControlKeyPressed: () => {return false as boolean},

    toggleAppOverlay: () => {},
    isAppOverlayVisible: false,
    getAppOverlayZIndex: () => {return 10 as number}
});


const mockAppUserEntity: AppUserEntity = new AppUserEntity(
    3,
    "user@user.com",
    "$2a$10$e4k/4uTWn/fnWA8KEYs/Zu.W1b4OWK82rXgwpZsvFhPPbFaYjZlBi",
    AppUserRole.USER,
    [
        {
          name: "tag14"
        }
    ],
    [
      {
        id: 20,
        title: "note20",
        noteInputEntitys: [
            {
                value: "const x = 3;\n\nadsf\nasdf",
                type: NoteInputEntityType.CODE,
                programmingLanguage: "Java"
            },
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputEntityType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            },
        ],
        tags: []
      },
      {
        id: 19,
        title: "note19",
        noteInputEntitys: [
            {
                value: "some <code>code</code>",
                type: NoteInputEntityType.PLAIN_TEXT
            },
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputEntityType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            },
        ],
        tags: []
      },
      {
        id: 18,
        title: "note18",
        noteInputEntitys: [
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputEntityType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            },
            {
                value: "<div>docker exec -<span class='hljs-keyword'>it</span> <input type='text' style='width: 110.375px' class='variableInput' placeholder='CONTAINER_ID'> /bin/bash</div>",
                type: NoteInputEntityType.CODE_WITH_VARIABLES,
                programmingLanguage: "_auto"
            }
        ],
        tags: [
            {
                name: "tag14"
            }
        ]
      }
    ],
    null
)