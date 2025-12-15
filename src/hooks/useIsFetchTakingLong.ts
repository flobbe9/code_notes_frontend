import { useEffect, useState } from "react";
import { useTimeout } from "./useTimeout";


/**
 * Indicates whether the fetch process is ongoing longer than expected.
 * 
 * @param isFetched indicates whether the fetch process has finished. See ```useQuery``` ```isFetched```
 * @param delay time the fetch may take before beeing considered as "taking longer" (in ms)
 * @param timerStartCondition see ```useTimeout```
 * @return ```true``` if timeout of given ```delay``` has finished and ```isFetched``` is still ```false``` 
 * @since 0.0.1
 */
export function useIsFetchTakingLong(isFetched: boolean, delay: number, timerStartCondition = true): boolean {
    
    const { finished } = useTimeout(delay, timerStartCondition);

    const [isFetchTakingLonger, setIsFetchTakingLonger] = useState(false);

    useEffect(() => {
        setIsFetchTakingLonger(finished && !isFetched);

    }, [finished, isFetched]);

    return isFetchTakingLonger;
}
