import DefaultProps from './DefaultProps';


/**
 * Props for helper components. Extends {@link DefaultProps}.
 * 
 * @since 0.1.4
 */
export default interface HelperProps extends DefaultProps {

    /** If false, this component will get passed ```display: none``` */
    rendered?: boolean
}