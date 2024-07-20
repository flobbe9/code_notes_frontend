import React, { createContext, useRef } from "react";
import "../../assets/styles/DefaultCodeBlock.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import DefaultBlock from "./DefaultBlock";
import Flex from "../helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function DefaultCodeBlock({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "DefaultCodeBlock");

    const componentRef = useRef(null);

    const context = {
        animateCopyIcon
    }


    /**
     * Animate the icon of the "copy" button.
     */
    function animateCopyIcon(): void {

        const copyIcon = $(componentRef.current!).find(".copyButton .fa-copy").first();

        copyIcon.animate(
            {
                opacity: 0,
                fontSize: "3em"
            },
            400,
            "easeOutSine",
            () => {
                copyIcon.css("opacity", 1);
                copyIcon.css("fontSize", "1em");
            }
        );
    } 

    
    return (
        <DefaultCodeBlockContext.Provider value={context}>
            <DefaultBlock>
                <div     
                    id={id} 
                    className={className}
                    style={style}
                    ref={componentRef}
                    {...otherProps}
                >
                    <Flex flexWrap="nowrap">
                        {/* CodeBlock */}
                        {children}
                    </Flex>
                </div>
            </DefaultBlock>
        </DefaultCodeBlockContext.Provider>
    )
}


export const DefaultCodeBlockContext = createContext({
    animateCopyIcon: () => {}
});