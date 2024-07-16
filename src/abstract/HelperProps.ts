import { CSSProperties } from 'react';
import DefaultProps from './DefaultProps';


/**
 * Props for helper components. Extends {@link DefaultProps}.
 * 
 * @since 0.0.1
 */
export default interface HelperProps extends DefaultProps {

    title?: string,
    /** If false, this component will get passed ```display: none``` */
    rendered?: boolean,
    disabled?: boolean,
    onClick?: (event?) => void,
    /** Not applied to ```<HelperDiv>``` */
    /** Style for given event */
    _hover?: CSSProperties,
    /** Style for given event */
    _focus?: CSSProperties,
    /** Style for given event */
    _disabled?: CSSProperties
}