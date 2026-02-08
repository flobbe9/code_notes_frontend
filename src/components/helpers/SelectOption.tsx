import { useContext, useEffect, useState } from 'react';
import DefaultProps, { getCleanDefaultProps } from '../../abstract/DefaultProps';
import Flex from './Flex';
import { SelectContext } from '@/context/SelectContext';

interface Props extends DefaultProps {
    label: string;

    /** See ```<Select>``` */
    multiSelect?: boolean;
}

/**
 * @paren ```<Select>```
 * @since 0.0.1
 * @author Florin Schikarski
 */
export default function SelectOption({ label, multiSelect, ...props }: Props) {
    const [isSelected, setIsSelected] = useState(false);

    const { selectedOptions } = useContext(SelectContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, 'SelectOption');

    useEffect(() => {
        setIsSelected(selectedOptions.has(label));
    }, [selectedOptions]);

    return (
        <Flex id={id} className={className} style={style} flexWrap="nowrap" {...otherProps}>
            {/* Label */}
            <div className="selectOptionLabel dontBreakText me-2 mt-1 fullWidth">{label}</div>

            {/* Selected icon */}
            <i className='fa-solid fa-check' hidden={!isSelected || !multiSelect} />

            {children}
        </Flex>
    );
}
