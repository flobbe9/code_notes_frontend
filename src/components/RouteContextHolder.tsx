import { AppContext } from "@/context/AppContext";
import { RouteContext } from "@/context/RouteContext";
import { Fragment, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PROTOCOL } from "../helpers/constants";
import { replaceCurrentBrowserHistoryEntry, scrollTop } from "../helpers/utils";



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

    const { forceToastTimeout } = useContext(AppContext);

    const context = {
        clearUrlQueryParams
    }


    useEffect(() => {
        scrollTop();
        forceToastTimeout();
        redirectWWW();

    }, [location]);


    /**
     * Remove any url query params, keeping the current url path. Wont refresh the page.
     * 
     * @param removeFromHistory indicates whether to remove the browser history entry with the url query params. Default is ```true```
     */
    function clearUrlQueryParams(_removeFromHistory = true): void {

        replaceCurrentBrowserHistoryEntry();

        navigate(window.location.pathname);
    }


    /**
     * Redirect to same url but without "www." since spring does not like www. :)
     */
    function redirectWWW(): void {

        const currentUrl = window.location.href;

        if (currentUrl.startsWith(PROTOCOL + "://www."))
            window.location.href = currentUrl.replace("www.", "");
    }


    return (
        <RouteContext.Provider value={context}>
            <Fragment>{children}</Fragment>
        </RouteContext.Provider>
    );
}
