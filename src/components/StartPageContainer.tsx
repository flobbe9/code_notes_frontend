import React, { createContext, useContext, useEffect, useState } from "react";
import DefaultProps from "../abstract/DefaultProps";
import StartPageContent from "./StartPageContent";
import StartPageSideBar from "./StartPageSideBar";
import Flex from "./helpers/Flex";
import { getCssConstant, getCSSValueAsNumber, isBlank, isNumberFalsy, log } from "../helpers/utils";
import { AppContext } from "./App";


interface Props extends DefaultProps {

}


/**
 * Container defining the context for all components on start page. Try to keep this as clean as possible and
 * write logic only for the context. Do styling in child components
 * 
 * @since 0.0.1
 */
export default function StartPageContainer({children, ...props}: Props) {

    const [isShowSideBar, setIsShowSideBar] = useState(false);

    const { windowSize, getDeviceWidth } = useContext(AppContext);
    const { isMobileWidth } = getDeviceWidth();

    const context = {
        isShowSideBar, 
        setIsShowSideBar,

        getStartPageSideBarWidth
    }


    useEffect(() => {
        updateStartPageContentWidth();

    }, [isShowSideBar, windowSize]);


    function updateStartPageContentWidth(): void {

        const startPageContent = $("#StartPageContent");
        const startPageContentWidth = calculateStartPageContentWidth();

        if (isNumberFalsy(startPageContentWidth))
            return;

        startPageContent.animate(
            {
                width: startPageContentWidth
            },
            100
        );
    }


    function calculateStartPageContentWidth(): number | undefined {

        const windowWidth = $("#App").innerWidth();

        // case: sidebar not rendered yet
        if (isBlank(windowWidth?.toString()))
            return;
        
        const windowWidthNumber = getCSSValueAsNumber(windowWidth!, 2);
        const sideBarWidthNumber = getStartPageSideBarWidth();

        return isShowSideBar ? windowWidthNumber - sideBarWidthNumber :
                               windowWidthNumber + sideBarWidthNumber;
    }


    /**
     * @returns the width of the expanded side bart, not including the toggle button and considering mobile mode.
     */
    function getStartPageSideBarWidth(): number {

        if (isMobileWidth) 
            return $(window).width()! * 0.3;

        return getCSSValueAsNumber(getCssConstant("startPageSideBarWidth"), 2);
    }


    return (
        <StartPageContainerContext.Provider value={context} {...props}>
            <Flex flexWrap="nowrap">
                <StartPageSideBar />

                <StartPageContent />
            </Flex>

            {children}
        </StartPageContainerContext.Provider>
    )
}


export const StartPageContainerContext = createContext({
    isShowSideBar: false, 
    setIsShowSideBar: (isShow: boolean) => {},

    getStartPageSideBarWidth: () => {return 0 as number}
});