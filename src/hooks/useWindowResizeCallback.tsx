import { useContext, useEffect, useState } from "react";
import { AppContext } from "../components/App";


/**
 * Listen to window resize using {@link AppContext} and execute given ```callback``` after last resize.
 * This will prevent the callback from beeing executed on every step of the resize.
 * 
 * @param callback called once timeout has finished successfuly
 * @param timeout time (in ms) to wait after last window resize for ```callback``` to execute
 * @since 0.0.1
 */
export default function useWindowResizeCallback(callback: () => any, timeout = 200): void {

    const [resizeTimeout, setResizeTimeout] = useState<NodeJS.Timeout>();

    const { windowSize } = useContext(AppContext);

    useEffect(() => {
        clearTimeout(resizeTimeout);
        setResizeTimeout(setTimeout(callback, timeout));

    }, [windowSize])
}