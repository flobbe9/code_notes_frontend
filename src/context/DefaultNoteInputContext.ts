import { createContext, RefObject } from "react";


export const DefaultNoteInputContext = createContext({
    isShowNoteInputSettings: false,
    setIsShowNoteInputSettings: (_isShow: boolean) => {},
    areNoteInputSettingsDisabled: false,
    setAreNoteInputSettingsDisabled: (_areDisabled: boolean) => {},

    codeNoteInputLanguage: "",
    setCodeNoteInputLanguage: (_language: string) => {},

    codeNoteInputWithVariablesLanguage: "", 
    setCodeNoteInputWithVariablesLanguage: (_language: string) => {},

    animateCopyIcon: () => {},

    isFullScreen: false as boolean,
    setActivateFullScreenStyles: ({} as Function),
    setDeactivateFullScreenStyles: ({} as Function),
    toggleFullScreen: (_event) => {},

    handleDeleteNote: (_event) => {},

    focusOnRender: false as boolean,

    componentRef: {} as RefObject<HTMLDivElement | null>
});
