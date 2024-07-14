import React, { createContext, useContext, useEffect, useState } from "react";
import DefaultProps from "../abstract/DefaultProps";
import StartPageContent from "./StartPageContent";
import StartPageSideBar from "./StartPageSideBar";
import Flex from "./helpers/Flex";
import { getCSSValueAsNumber, isBlank, log } from "../helpers/utils";
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

    const [startPageSidebarWidth, setStartPageSideBarWidth] = useState<string>();
    const [startPageContentWidth, setStartPageContentWidth] = useState<string>();

    const { windowSize } = useContext(AppContext);

    const context = {
        setStartPageSideBarWidth
    }


    useEffect(() => {
        updateStartPageContentWidth();

    }, [startPageSidebarWidth, windowSize]);


    function updateStartPageContentWidth(): void {

        setStartPageContentWidth(calculateStartPageContentWidth());
    }


    function calculateStartPageContentWidth(): string | undefined {

        const windowWidth = $("#App").innerWidth();

        // case: sidebar not rendered yet
        if (isBlank(startPageSidebarWidth) || isBlank(windowWidth?.toString()))
            return;
        
        const windowWidthNumber = getCSSValueAsNumber(windowWidth!, 2);
        const sideBarWidthNumber = getCSSValueAsNumber(startPageSidebarWidth!, 0);

        return (windowWidthNumber - sideBarWidthNumber) + "px";
    }


    return (
        <StartPageContext.Provider value={context} {...props}>
            <Flex flexWrap="nowrap">
                <StartPageSideBar />

                <StartPageContent style={{width: startPageContentWidth}} />
            </Flex>

            {children}
        </StartPageContext.Provider>
    )
}


export const StartPageContext = createContext({

    setStartPageSideBarWidth: (width: string | undefined) => {}
});