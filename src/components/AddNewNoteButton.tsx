import React, { useContext } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import HelperProps from "../abstract/HelperProps";
import ButtonWithSlideLabel from "./helpers/ButtonWithSlideLabel";
import { StartPageContentContext } from "./StartPageContent";
import Button from "./helpers/Button";


interface Props extends HelperProps {

}


/**
 * @since 0.0.1
 */
export default function AddNewNoteButton({...props}: Props) {

    const { notes } = useContext(StartPageContentContext)

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "AddNewNoteButton", true);


    return (
        <>
            {
                notes.length ? 
                    <ButtonWithSlideLabel 
                        id={id} 
                        className={className}
                        style={style}
                        label="New note"
                        {...otherProps}
                        
                    >
                        <i className="fa-solid fa-plus"></i>

                        {children}
                    </ButtonWithSlideLabel>
                    :
                    <Button
                        id={id} 
                        className={className + " fullWidth"}
                        style={style}
                        {...otherProps}
                    >
                        <i className="fa-solid fa-plus me-1"></i> New Note

                        {children}
                    </Button>
            }
        </>
    )
}