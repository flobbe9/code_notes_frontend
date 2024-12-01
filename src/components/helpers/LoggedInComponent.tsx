import React, { ReactNode, useContext } from "react";
import { AppFetchContext } from "../AppFetchContextHolder";
import ConditionalComponent from "./ConditionalComponent";


interface Props {
    element: ReactNode
    redirectPath?: string
}


/**
 * @since 0.0.1
 */
export default function LoggedInComponent(props: Props) {

    const { isLoggedIn } = useContext(AppFetchContext);

    return <ConditionalComponent condition={isLoggedIn} {...props} />
}