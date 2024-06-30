import React, { createContext } from "react";
import "../assets/styles/StartPageContent.css";
import DefaultProps from "../abstract/DefaultProps";
import StartPageContent from "./StartPageContent";
import StartPageSideBar from "./StartPageSideBar";
import Flex from "./helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * Container defining the context for all components on start page. Try to keep this as clean as possible and
 * use this only for the context.
 * 
 * @since 0.0.1
 */
export default function StartPageContainer({children, ...otherProps}: Props) {

    const context = {

    }

    return (
        <StartPageContext.Provider value={context}>
            <Flex>
                <StartPageSideBar className="col-4" />

                <StartPageContent className="col-8" />
            </Flex>

            {children}
        </StartPageContext.Provider>
    )
}


export const StartPageContext = createContext({

});