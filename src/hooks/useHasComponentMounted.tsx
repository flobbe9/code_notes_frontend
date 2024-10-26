import { useEffect, useState } from "react";


/**
 * Simply sets a state to true on first render and returns it.
 * 
 * @since 0.0.1
 */
export function useHasComponentMounted() {

    const [hasComponntMounted, setHasComponentMounted] = useState(false);


    useEffect(() => {
        setHasComponentMounted(true);
    }, []);

    return hasComponntMounted;
}