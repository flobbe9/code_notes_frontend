import React, { createContext, Fragment, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { replaceCurrentBrowserHistoryEntry } from "../helpers/utils";
import { AppContext } from "./App";



/**
 * Component guaranteed to be inside ```<BrowserRouter>``` making hooks like useNavigate() available.
 * 
 * Call global navigation methods etc. in here.
 * 
 * @since 0.0.1
 */
export default function RouteContextHolder({children}) {

    const location = useLocation();
    const navigate = useNavigate();

    const { moveToast } = useContext(AppContext);

    const context = {
        clearUrlQueryParams
    }


    useEffect(() => {
        scrollTop();
        moveToast(true);

    }, [location]);


    /**
     * Apparently when navigating to a history entry, the scroll state is preserved despite this function call.
     * 
     * Only scroll to ```y=0```, leave x as it is
     */
    function scrollTop(): void {

        window.scrollTo(window.scrollX, 0);
    }


    /**
     * Remove any url query params, keeping the current url path. Wont refresh the page.
     * 
     * @param removeFromHistory indicates whether to remove the browser history entry with the url query params. Default is ```true```
     */
    function clearUrlQueryParams(removeFromHistory = true): void {

        replaceCurrentBrowserHistoryEntry();

        navigate(window.location.pathname);
    }


    return (
        <RouteContext.Provider value={context}>

            <Fragment>{children}</Fragment>
        </RouteContext.Provider>
    );
}


export const RouteContext = createContext({
    clearUrlQueryParams:(removeFromHistory = true) => {}
})