import { DefinedUseQueryResult } from "@tanstack/react-query";
import { Fragment, ReactNode, useContext, useEffect } from "react";
import { AppContext } from "../App";


interface Props {
    /** Returned by the ```useQuery``` hook. Contains what is currently fetching */
    useQueryResult: DefinedUseQueryResult
    /** See ```useIsFetchTakingLong``` */
    isFetchTakingLong: boolean,
    /** Will be displayed below the pending icon (centered) */
    overlayContent?: ReactNode
}


/**
 * Will display the app pending overlay (see {@link showPendingOverlay}) fetch is taking too long.
 * 
 * Wont render content.
 * 
 * @since 0.0.1
 */
export default function PendingFetchHelper({
    useQueryResult,
    isFetchTakingLong,
    overlayContent
}: Props) {

    const { showPendingOverlay, hidePendingOverlay } = useContext(AppContext);


    useEffect(() => {
        handleFetchNoteEntitiesTakingLonger();

    }, [isFetchTakingLong, useQueryResult.isFetched]);

    
    function handleFetchNoteEntitiesTakingLonger(): void {

        // case: fetch was quick enough, dont do anything
        if (!isFetchTakingLong)
            return;

        if (!useQueryResult.isFetched)
            showPendingOverlay(overlayContent);
        else
            hidePendingOverlay(); 
    }


    return (<Fragment />)
}
