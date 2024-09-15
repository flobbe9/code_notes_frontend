import $ from "jquery";
import React, { forwardRef, LegacyRef, useContext } from "react";
import "../../assets/styles/Toast.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Flex from "./Flex";
import { AppContext } from "../App";


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

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Toast", true);

    const { moveToast } = useContext(AppContext);


    return (
        <div 
            id={id} 
            ref={ref}
            className={className}
            style={style}
            {...otherProps}
        >
            <div className={"textContainer " + sevirity}>
                <div className="summary">
                    <Flex>
                        <div className="col-10"><strong>{summary}</strong></div>
                        <span className="col-2 textRight hover" onClick={() => moveToast(true)}>
                            <i className="fa-solid fa-xmark fa-xl "></i>
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