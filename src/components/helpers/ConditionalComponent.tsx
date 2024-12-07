import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { isBlank, isPathRelative, replaceCurrentBrowserHistoryEntry } from "../../helpers/utils";


interface Props {
    condition: boolean,
    element: ReactNode
    /** Relative path to redirect to if ```condition``` is ```false```. If blank will go back one history entry (refreshing the page) */
    redirectPath?: string
}


/**
 * Render given ```element``` or redirect if ```condition``` is not ```true```.
 * 
 * Will go back to last page by default or redirect to given ```redirectPath``` if not blank.
 * 
 * @since 0.0.1
 */
export default function ConditionalComponent({condition, element, redirectPath}: Props) {

    const navigate = useNavigate();

    if (!condition) {
        if (!isBlank(redirectPath) && isPathRelative(redirectPath)) {
            replaceCurrentBrowserHistoryEntry(redirectPath);
            navigate(redirectPath!);

        } else 
            window.history.back();

        return;
    }

    return element;
}