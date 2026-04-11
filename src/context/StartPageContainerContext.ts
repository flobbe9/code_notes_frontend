import { createContext } from "react";

export const StartPageContainerContext = createContext({
    isStartPageSideBarVisible: false, 
    setIsStartPageSideBarVisible: (_isShow: boolean) => {},

    isUpdateSideBarTagList: true as (boolean | undefined), 
    setIsUpdateSideBarTagList: ((_update: boolean | undefined) => {}) as React.Dispatch<React.SetStateAction<boolean | undefined>>,
    updateStartPageSideBarTagList: () => {},

    getStartPageSideBarWidth: () => {return 0 as number},
});
