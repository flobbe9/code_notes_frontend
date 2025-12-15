import { useEffect, useState } from "react";


/**
 * @param ms duration of the timeout in milliseconds
 * @param startCondition whether to start the timeout in the first place. Default is ```true```
 * @returns the state that indicates if the timeout function has finished (```true```) or not (```false```). Initial value is ```false```
 * @since 0.0.1
 */
export function useTimeout(ms: number, startCondition = true) {

    const [finished, setFinished] = useState(false);


    useEffect(() => {
        if (!startCondition)
            return;

        setTimeout(() => {
            setFinished(true);
        }, ms);
    }, []);


    return { finished };
}
