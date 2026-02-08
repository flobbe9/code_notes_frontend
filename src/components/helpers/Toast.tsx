import { forwardRef, LegacyRef, useContext } from "react";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { isBlank } from "../../helpers/utils";
import { AppContext } from "../App";
import Flex from "./Flex";


interface Props extends DefaultProps {
    summary: string,
    message?: string
    /** Default is ```info``` */
    sevirity?: ToastSevirity,
}


/**
 * z-index 10
 * 
 * @since 0.0.1
 */
export default forwardRef(function Toast({summary, message = "", sevirity = "info", ...props}: Props, ref: LegacyRef<HTMLDivElement> | undefined) {

    const { children, ...otherProps } = getCleanDefaultProps(props, "Toast", true);

    const { moveToast } = useContext(AppContext);

    return (
        <div 
            ref={ref}
            {...otherProps}
        >
            <div className={"textContainer " + sevirity}>
                <div className={`summary ${isBlank(message) ? '' : 'mb-3'}`}>
                    <Flex flexWrap="nowrap">
                        <div className="fullWidth"><strong>{summary}</strong></div>
                        <span className="ms-3 textRight hover" onClick={() => moveToast(true)}>
                            <i className="fa-solid fa-xmark fa-xl"></i>
                        </span>
                    </Flex>
                </div>

                <div className="message">
                    {message}
                </div>
            </div>
                
            {children}
        </div>
    )
});


export type ToastSevirity = "error" | "warn" | "info" | "success";
