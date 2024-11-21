import { cn } from '@internalpackage/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import React, { useContext } from 'react';
import { colorPickerContext } from '../context';

interface Props {
    className?: string;
    id?: string;
}

export const Trigger = React.forwardRef<HTMLInputElement, Props>(({ className, id }, ref) => {
    const {
        open,
        color,
        config: { disabled },
    } = useContext(colorPickerContext);

    return (
        <PopoverPrimitive.Trigger asChild>
            <input
                ref={ref}
                disabled={disabled}
                id={id}
                type="button"
                className={cn(
                    'focus-visible:ring-ring h-4 w-4 cursor-pointer rounded-full focus:ring-2 focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2',
                    className,
                    open ? 'ring-ring ring-2 ring-offset-2' : ''
                )}
                style={{ backgroundColor: color.toString() }}
            />
        </PopoverPrimitive.Trigger>
    );
});
