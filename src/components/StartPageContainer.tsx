import $ from "jquery";
import React, { createContext, useContext, useEffect, useState } from "react";
import DefaultProps from "../abstract/DefaultProps";
import { getHeadTitleText } from "../helpers/constants";
import { confirmPageUnload, getCssConstant, getCSSValueAsNumber, getCurrentUrlWithoutWWW, isBlank, isNumberFalsy, log } from "../helpers/utils";
import { AppContext } from "./App";
import Head from "./Head";
import StartPageContent from "./StartPageContent";
import StartPageSideBar from "./StartPageSideBar";
import Confirm from "./helpers/Confirm";
import Flex from "./helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * Container defining the context for all components on start page. Try to keep this as clean as possible and
 * write logic only for the context. Do styling in child components
 * 
 * @parent ```<App>```
 * @since 0.0.1
 */
export default function StartPageContainer({children, ...props}: Props) {

    const [isShowSideBar, setIsShowSideBar] = useState(false);
    /** State that will trigger the sidebar to update some states if changed. ```undefined``` should stay the init value */
    const [updateSideBarStates, setUpdateSideBarStates] = useState<boolean>();

    /** List of tag entities inside ```<StartPageSideBarTagList>``` that are checked */
    const [selectedTagEntityNames, setSelectedTagEntityNames] = useState<Set<string>>(new Set());

    const { windowSize, getDeviceWidth, setPopupContent } = useContext(AppContext);
    const { isMobileWidth } = getDeviceWidth();

    const context = {
        isShowSideBar, 
        setIsShowSideBar,

        updateSideBarStates, 
        setUpdateSideBarStates,

        getStartPageSideBarWidth,

        selectedTagEntityNames, 
        setSelectedTagEntityNames
    }


    useEffect(() => {
        confirmPageUnload(handlePageUnload);

    }, []);


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
    

    // TODO: somehow know whether changes have been made :)
    function handlePageUnload(event: Event): void {

        setPopupContent(
            <Confirm
                heading={<h3>Save changes?</h3>}
                message={"There are some unsaved changes. Would you like to save them?"}
                confirmLabel="Save"
                cancelLabel="Don't save"
                onConfirm={(event) => log("saving...")} // TODO: implement save
            />
        );
    }


    return (
        <StartPageContainerContext.Provider value={context} {...props}>
            <Head headTagStrings={[
                `<link rel='canonical' href='${getCurrentUrlWithoutWWW()}' />`,
                `<title>${getHeadTitleText()}</title>`,
            ]} />

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

    updateSideBarStates: true as (boolean | undefined), 
    setUpdateSideBarStates: (update: boolean | undefined) => {},

    getStartPageSideBarWidth: () => {return 0 as number},

    selectedTagEntityNames: new Set() as Set<string>, 
    setSelectedTagEntityNames: (tagEntities: Set<string>) => {}
});