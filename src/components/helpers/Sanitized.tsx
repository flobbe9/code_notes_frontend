import React, { createElement, ReactNode, useEffect, useState } from "react";
import { getCleanDefaultProps } from "../../abstract/DefaultProps";
import sanitize from "sanitize-html";
import parse, { Element, HTMLReactParserOptions, attributesToProps } from "html-react-parser";
import { DEFAULT_HTML_SANTIZER_OPTIONS } from "../../helpers/constants";
import { getRandomString, includesIgnoreCaseTrim, log, logError } from "../../helpers/utils";
import HelperProps from "../../abstract/HelperProps";


interface Props extends HelperProps {

    dirtyHTML: string,
    /** Will fully replace the default options */
    parseOptions?: HTMLReactParserOptions,
    /** Will fully replace the default options */
    sanitizeOptions?: sanitize.IOptions,
    /** Tag names that component props will be passed to. Default is ```["div"]``` */
    mainTagNames?: (keyof HTMLElementTagNameMap)[]
}


/**
 * Component that sanitizes and parses given html string safely. See default sanizing options here: {@link DEFAULT_HTML_SANTIZER_OPTIONS}
 * 
 * @since 0.0.1
 */
export default function Sanitized({
    dirtyHTML,
    mainTagNames = ["div"],
    parseOptions,
    sanitizeOptions,
    rendered = true,
    ...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps);

    // add component props to parsed html
    const defaultParserOptions: HTMLReactParserOptions = {
        replace(domNode) {
            return nodeToJSXElement(domNode as Element);
        }
    }


    /**
     * @param node to convert to jsx element
     * @returns jsx element of given ```node``` or ```null``` if given ```node``` is falsy
     */
    function nodeToJSXElement(node: Element): JSX.Element | null {

        // case: invalid node
        if (!node || !node.attribs) 
            return null;

        // pass component props to 
        const tagName = node.name;
        const newProps = combineProps(node);
        
        // case: no children
        if (!node.children || !node.children.length)
            return React.createElement(tagName, newProps)

        // map children to jsx elements
        const children = mapNodeChildrenToReactNode(node);
        
        return React.createElement(tagName, newProps, children);
    }


    /**
     * Combine ```node``` props and component's props if tag name of ```node``` is included in ```mainTagNames```.
     * 
     * @param node to get props from
     * @returns combined props of ```node``` props and this component's props
     */
    function combineProps(node: Element): object {

        // case: invalid node
        if (!node || !node.attribs) 
            return {};
        
        const nodeProps = attributesToProps(node.attribs);

        // case: is not main tag
        if (!isMainTagName(node)) 
            return {...nodeProps, key: getRandomString()};

        // combine node and component properties
        return {
            ...nodeProps,
            id: (nodeProps.id || "") + (id || ""),
            className: (nodeProps.className || "") + " " + (className || ""),
            style: {...nodeProps.style, ...style},
            key: getRandomString()
        }
    }


    /**
     * @param node to get the children from
     * @returns array of ReactNodes of ```node.children```
     */
    function mapNodeChildrenToReactNode(node: Element): ReactNode[] {

        return node.children.map(child => {
            const childElement = child as Element;
            
            // case: only text as children
            if (child.type === "text")
                return child.data;

            return nodeToJSXElement(childElement);
        });
    }


    /**
     * @param node to check the tag name of
     * @returns true if ```node.name``` is included in ```mainTagNames``` (ignore case)
     */
    function isMainTagName(node: Element): boolean {

        if (!mainTagNames || !mainTagNames.length)
            return false;

        return includesIgnoreCaseTrim(mainTagNames, node.name);
    }


    // case: not rendered
    if (!rendered)
        return <></>;


    return (
        <>
            {/* InnerHTML */}
            {
                parse(
                    sanitize(dirtyHTML, sanitizeOptions || DEFAULT_HTML_SANTIZER_OPTIONS), 
                    parseOptions || defaultParserOptions
                )
            }

            {/* InnerBlocks */}
            {children}
        </>
    )
}