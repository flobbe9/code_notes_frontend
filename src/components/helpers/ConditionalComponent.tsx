import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { START_PAGE_PATH } from "../../helpers/constants";


interface Props {
    condition: boolean,
    element: ReactNode
    redirectPath?: string
}


/**
 * Render given ```element``` or redirect if ```condition``` is not ```true```.
 * 
 * @since 0.0.1
 */
export default function ConditionalComponent({condition, element, redirectPath = START_PAGE_PATH}: Props) {

    const navigate = useNavigate();

    if (!condition) {
        navigate(redirectPath);
        return;
    }

    return element;
}