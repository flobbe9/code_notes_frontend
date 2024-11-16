import React, { Fragment, useEffect } from "react";
import { useLocation } from "react-router-dom";



/**
 * Component guaranteed to be inside ```<BrowserRouter>``` making hooks like useNavigate() available.
 * 
 * Call global navigation methods etc. in here.
 * 
 * @since 0.0.1
 */
export default function RouteContext({children}) {

    const location = useLocation();

    useEffect(() => {
        scrollTop();

    }, [location]);


    /**
     * Apparently when navigating to a history entry, the scroll state is preserved despite this function call.
     * 
     * Only scroll to ```y=0```, leave x as it is
     */
    function scrollTop(): void {
        window.scrollTo(window.scrollX, 0);
    }


    return (<Fragment>{children}</Fragment>)
}