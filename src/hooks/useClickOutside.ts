import { logDebug } from "@/helpers/logUtils";
import { assertFalsyAndThrow } from "@/helpers/utils";
import { useEffect, type RefObject } from "react";

/**
 * @param ref of the object that is considered "inside"
 * @param callback to execute on click outside
 * @param eventTrigger action that possibly triggers the callback
 * @since 0.0.1
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    callback: (eventTrigger: Event) => void,
    eventTrigger: "click" | "mousedown" | "mouseup" | "focus" = "click"
) {
    assertFalsyAndThrow(ref, callback, eventTrigger);

    useEffect(() => {
        document.addEventListener(eventTrigger, handleEvent);

        return () => {
            document.removeEventListener(eventTrigger, handleEvent);
        }
    }, []);

    function handleEvent(event: Event): void {
        const target = event.target as Node;

        if (!target?.isConnected || !ref?.current) {
            logDebug("no handling event, target not connected or ref.current falsy");
            return;
        }

        const isOutside = !ref.current.contains(target);

        if (isOutside)
            callback(event);
    }
}