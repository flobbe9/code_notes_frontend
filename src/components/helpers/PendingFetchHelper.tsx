import React, { ReactNode, useContext, useEffect } from "react";
import "../../assets/styles/App.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { DefinedUseQueryResult } from "@tanstack/react-query";
import { AppContext } from "../App";


interface Props extends DefaultProps {
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
 * @since 0.0.1
 */
export default function PendingFetchHelper({
    useQueryResult,
    isFetchTakingLong,
    overlayContent,
    ...props
}: Props) {

    const { showPendingOverlay, hidePendingOverlay } = useContext(AppContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "PendingFetchHelper");


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


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            {children}
        </div>
    )
}