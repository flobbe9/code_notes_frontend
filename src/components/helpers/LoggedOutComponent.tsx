import React, { ReactNode, useContext } from "react";
import { AppFetchContext } from "../AppFetchContextProvider";
import ConditionalComponent from "./ConditionalComponent";


interface Props {
    children: ReactNode
    redirectPath?: string
}


/**
 * @since 0.0.1
 */
export default function LoggedOutComponent(props: Props) {

    const { isLoggedIn, isLoggedInUseQueryResult } = useContext(AppFetchContext);

    return <ConditionalComponent condition={!isLoggedIn || !isLoggedInUseQueryResult.isFetched} {...props} />
}