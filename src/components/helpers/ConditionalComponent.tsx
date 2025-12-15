import React, { Fragment, ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { START_PAGE_PATH } from "../../helpers/constants";
import { isBlank, isPathRelative, replaceCurrentBrowserHistoryEntry } from "../../helpers/utils";


interface Props {
    children: ReactNode
    condition: boolean,
    /** Relative path to redirect to if ```condition``` is ```false```. */
    redirectPath?: string
}


/**
 * Render given ```element``` or redirect if ```condition``` is not ```true```.
 * 
 * Will redirect to given ```redirectPath``` if not blank. Else will go back to last page or (if ther's no last page)
 * navigate to {@link START_PAGE_PATH}.
 * 
 * @since 0.0.1
 */
export default function ConditionalComponent({condition, children, redirectPath}: Props) {

    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        if (!condition) {
            // case: got a valid redirect path
            if (!isBlank(redirectPath) && isPathRelative(redirectPath)) {
                replaceCurrentBrowserHistoryEntry(redirectPath);
                navigate(redirectPath!);
    
            // case: can go to last visited page
            } else if (window.history.length > 2) {
                window.history.back();

            // case: don't use last visited page (happens e.g. when redirect into new tab)
            } else {
                replaceCurrentBrowserHistoryEntry(START_PAGE_PATH);
                navigate(START_PAGE_PATH);
            }
        }

    }, [condition, location]);


    return (
        <Fragment>
            {condition && children}
        </Fragment>
    )
}
