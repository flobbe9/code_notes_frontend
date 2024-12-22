import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import DefaultProps from "../../../abstract/DefaultProps";
import { confirmPageUnload, getCssConstant, getCSSValueAsNumber, getCurrentUrlWithoutWWW, getHeadTitleText, isNumberFalsy, removeConfirmPageUnload } from "../../../helpers/utils";
import { AppContext } from "../../App";
import { AppFetchContext } from "../../AppFetchContextHolder";
import Flex from "../../helpers/Flex";
import Head from "../../helpers/Head";
import StartPageContent from "./StartPageContent";
import StartPageSideBar from "./StartPageSideBar";


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

    const { isMobileWidth, setHasAnyNoteBeenEdited, hasAnyNoteBeenEdited } = useContext(AppContext);
    const { noteEntities } = useContext(AppFetchContext);

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
        setEditedNoteIds,
    }


    useEffect(() => {
        updateHasAnyNoteBeenEdited();
        
    }, [editedNoteIds, noteEntities]);
    
    
    useEffect(() => {
        addOrRemovePageUnloadEvent();

        return () => {
            removeConfirmPageUnload(handlePageUnload);
        }

    }, [hasAnyNoteBeenEdited])


    /**
     * Simply toggle the ```isIsUpdateSideBarTagList``` state.
     */
    function updateStartPageSideBarTagList(): void {
        setIsUpdateSideBarTagList(!isupdateSideBarTagList)
    }


    /**
     * @returns the width of the expanded side bart, not including the toggle button and considering mobile mode.
     */
    function getStartPageSideBarWidth(): number {

        if (isMobileWidth) 
            return window.outerWidth * 0.3;

        return getCSSValueAsNumber(getCssConstant("startPageSideBarWidth"), 2);
    }


    function addOrRemovePageUnloadEvent(): void {

        if (hasAnyNoteBeenEdited) 
            confirmPageUnload(handlePageUnload); 

        else 
            removeConfirmPageUnload(handlePageUnload);
    }
    

    const handlePageUnload = useCallback((event: BeforeUnloadEvent) => {

        event.preventDefault();
    }, []);


    function updateHasAnyNoteBeenEdited(): void {

        const hasEditedNotes = !!editedNoteIds.size;

        const hasNewNotes = !!noteEntities.find(noteEntity => isNumberFalsy(noteEntity.id));

        setHasAnyNoteBeenEdited(hasEditedNotes || hasNewNotes);
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
    setEditedNoteIds: (editedNoteIds: Set<Number>) => {},
});