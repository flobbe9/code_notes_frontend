import { CSSProperties, FormEvent, MouseEvent } from "react";
import { ButtonType } from "./CSSTypes";
import HelperProps from "./HelperProps";


export interface ButtonProps extends HelperProps {
    
    /** Button type (e.g. "submit") */
    type?: ButtonType,
    tabIndex?: number,
    onSubmit?: (event?: FormEvent) => void,
    /** 
     * Button will be disabled and show "spinner" while awaiting the promise. 
     * Remember to set this button's color explicitly for the "spinner" to match children's color.
     */
    onClickPromise?: (event?: MouseEvent) => Promise<any>,
    /** Styles on click */
    _click?: CSSProperties,
}