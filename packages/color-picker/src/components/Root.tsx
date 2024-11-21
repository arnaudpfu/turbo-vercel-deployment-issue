import * as PopoverPrimitive from '@radix-ui/react-popover';
import React, { useCallback, useState } from 'react';
import SuperColor, { SuperColorFormat } from 'super-color';
import { colorPickerContext } from '../context';

interface Props {
    defaultColor?: string;
    onColorChange?: (color: string) => void;
    constraint?: (color: SuperColor) => SuperColor;
    disabled?: boolean;
    children: React.ReactNode;
}

export const Root: React.FC<Props> = ({ defaultColor, onColorChange, disabled = false, children }) => {
    const [color, setColor] = useState<SuperColor>(new SuperColor(defaultColor || '#000000'));
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<SuperColorFormat>(color.getFormat());

    const handleChange = useCallback(
        (newColor: SuperColor) => {
            const colorString = newColor.toString();
            onColorChange?.(colorString);
            setColor(new SuperColor(colorString));
        },
        [onColorChange]
    );

    const handleOpenChange = useCallback((openValue: boolean) => {
        if (disabled) return;
        setOpen(openValue);
    }, []);

    return (
        <colorPickerContext.Provider
            value={{
                color,
                setColor: handleChange,
                format,
                setFormat,
                open,
                config: { disabled },
            }}
        >
            <PopoverPrimitive.Root open={disabled ? false : open} onOpenChange={handleOpenChange}>
                {children}
            </PopoverPrimitive.Root>
        </colorPickerContext.Provider>
    );
};
