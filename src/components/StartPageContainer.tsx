import $ from "jquery";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import DefaultProps from "../abstract/DefaultProps";
import { getHeadTitleText } from "../helpers/constants";
import { confirmPageUnload, getCssConstant, getCSSValueAsNumber, getCurrentUrlWithoutWWW, isBlank, isNumberFalsy, log, removeConfirmPageUnload } from "../helpers/utils";
import { AppContext } from "./App";
import Head from "./Head";
import StartPageContent from "./StartPageContent";
import StartPageSideBar from "./StartPageSideBar";
import Confirm from "./helpers/Confirm";
import Flex from "./helpers/Flex";
import { AppFetchContext } from "./AppFetchContextHolder";
import { useNavigate } from "react-router-dom";


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
    /** State that will trigger the sidebar tag list to update. ```undefined``` should stay the init value */
    const [isupdateSideBarTagList, setIsUpdateSideBarTagList] = useState<boolean>();

    /** List of tag entities inside ```<StartPageSideBarTagList>``` that are checked */
    const [selectedTagEntityNames, setSelectedTagEntityNames] = useState<Set<string>>(new Set());

    /** List of note ids that have been edited since they were last saved. Remove a note id from this list, once the note gets saved */
    const [editedNoteIds, setEditedNoteIds] = useState<Set<Number>>(new Set());

    const { windowSize, isMobileWidth, showPopup } = useContext(AppContext);
    const { isLoggedIn, noteEntities } = useContext(AppFetchContext);

    const navigate = useNavigate();

    const context = {
        isShowSideBar, 
        setIsShowSideBar,

        isupdateSideBarTagList, 
        setIsUpdateSideBarTagList,
        updateStartPageSideBarTagList,

        getStartPageSideBarWidth,

        selectedTagEntityNames, 
        setSelectedTagEntityNames,

        editedNoteIds,
        setEditedNoteIds
    }


    useEffect(() => {
        updateStartPageContentWidth();

    }, [isShowSideBar, windowSize]);


    useEffect(() => {
        addOrRemovePageUnloadEvent();

        return () => {
            removeConfirmPageUnload(handlePageUnload);
        }

    }, [editedNoteIds, noteEntities]);


    /**
     * Simply toggle the ```isIsUpdateSideBarTagList``` state.
     */
    function updateStartPageSideBarTagList(): void {
        setIsUpdateSideBarTagList(!isupdateSideBarTagList)
    }


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


    function addOrRemovePageUnloadEvent(): void {

        if (hasUnsavedChanges()) 
            confirmPageUnload(handlePageUnload, false); 

        else 
            removeConfirmPageUnload(handlePageUnload);
    }
    

    const handlePageUnload = useCallback((event: BeforeUnloadEvent) => {

        event.preventDefault();

        window.scrollTo(0, 1000)

        // showPopup(
        //     <Confirm
        //         heading={<h3>Save all changes?</h3>}
        //         message={"There are some unsaved changes. Would you like to save them?"}
        //         confirmLabel="Save"
        //         cancelLabel="Don't save"
        //         focusConfirmOnRender
        //         onConfirm={(event) => {log("saving..."); setEditedNoteIds(new Set())}} // TODO: implement save
        //     />
        // );
    }, []);


    function hasUnsavedChanges(): boolean {

        if (isLoggedIn) 
            return !!editedNoteIds.size;

        return !!noteEntities.length;
    }


    return (
        <StartPageContainerContext.Provider value={context} {...props}>
            <Head headTagStrings={[
                `<link rel='canonical' href='${getCurrentUrlWithoutWWW()}' />`,
                `<title>${getHeadTitleText()}</title>`,
                `<meta name="description" content="Edit, save and manage your coding notes. Save code snippets with variables and quickly insert values to copy your custom command. Use build in VSCode editor to comfortably edit your notes." />`
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

    isupdateSideBarTagList: true as (boolean | undefined), 
    setIsUpdateSideBarTagList: (update: boolean | undefined) => {},
    updateStartPageSideBarTagList: () => {},

    getStartPageSideBarWidth: () => {return 0 as number},

    selectedTagEntityNames: new Set() as Set<string>, 
    setSelectedTagEntityNames: (tagEntities: Set<string>) => {},

    editedNoteIds: new Set<Number>(),
    setEditedNoteIds: (editedNoteIds: Set<Number>) => {}
});