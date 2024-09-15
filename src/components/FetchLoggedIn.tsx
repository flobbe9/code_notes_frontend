import React from "react";
import { useLoggedIn } from "../hooks/useLoggedIn";


/**
 * @since 0.0.1
 */
export default function FetchLoggedIn() {

    useLoggedIn();

    return (<></>)
}