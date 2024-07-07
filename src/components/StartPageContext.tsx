import React, { createContext } from "react";
import DefaultProps from "../abstract/DefaultProps";
import StartPageContent from "./StartPageContent";
import StartPageSideBar from "./StartPageSideBar";
import Flex from "./helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * Container defining the context for all components on start page. Try to keep this as clean as possible and
 * write logic only for the context. Do styling in child components
 * 
 * @since 0.0.1
 */
// TODO: mobile
export default function StartPageContainer({children, ...otherProps}: Props) {

    const context = {

    }

    return (
        <StartPageContext.Provider value={context}>
            <Flex flexWrap="nowrap">
                {/* TODO: make width relative to window */}
                <StartPageSideBar />

                <StartPageContent />
            </Flex>

            {children}
        </StartPageContext.Provider>
    )
}


export const StartPageContext = createContext({

});