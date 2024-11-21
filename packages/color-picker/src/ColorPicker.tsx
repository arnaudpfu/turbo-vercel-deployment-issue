import * as PopoverPrimitive from '@radix-ui/react-popover';
import React from 'react';
import { Alpha } from './components/Alpha';
import { ColorFields } from './components/ColorFields';
import { FormatSwitcher } from './components/FormatSwitcher';
import { Hue } from './components/Hue';
import { Portal } from './components/Portal';
import { Render } from './components/Render';
import { Root } from './components/Root';
import { Saturation } from './components/Saturation';
import { Trigger } from './components/Trigger';

interface ColorPickerProps {
    defaultColor: string;
    onChange: (color: string) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    width?: number;
}

export const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
    ({ defaultColor, onChange, width, id, className, disabled }, ref) => {
        return (
            <Root defaultColor={defaultColor} onColorChange={onChange} disabled={disabled}>
                <Trigger ref={ref} id={id} className={className} />
                <Portal>
                    <PopoverPrimitive.Content
                        align="center"
                        side="bottom"
                        sideOffset={10}
                        className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[300] w-72 w-auto rounded-md border p-2 shadow-md outline-none"
                    >
                        <div style={{ width }} className="w-[200px] rounded-sm">
                            <Saturation />
                            <div className="px-1 pt-4">
                                <div className="flex gap-x-2">
                                    <Render />
                                    <div className="flex flex-1 flex-col gap-y-2">
                                        <Hue className="rounded-md border" />
                                        <Alpha className="rounded-md border" />
                                    </div>
                                </div>
                                <div className="flex gap-x-2 pt-3">
                                    <ColorFields />
                                    <FormatSwitcher />
                                </div>
                            </div>
                        </div>
                    </PopoverPrimitive.Content>
                </Portal>
            </Root>
        );
    }
);
