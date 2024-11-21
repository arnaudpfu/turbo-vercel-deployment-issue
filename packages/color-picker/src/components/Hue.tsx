import { cn } from '@internalpackage/utils';
import * as Slider from '@radix-ui/react-slider';
import React, { useContext } from 'react';
import { colorPickerContext } from '../context';

interface HueProps {
    className?: string;
    cursorClassName?: string;
}

export const Hue: React.FC<HueProps> = ({ className, cursorClassName }) => {
    const { color, setColor } = useContext(colorPickerContext);
    const hsla = color.toHsla();

    const handleChange = ([hue]: number[]) => {
        color.setHue(hue * 3.59);
        setColor(color);
    };

    return (
        <Slider.Root
            className={cn('relative flex h-2 w-full items-center', className)}
            style={{
                background:
                    'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
            }}
            value={[hsla.h / 3.59]}
            max={100}
            step={1}
            onValueChange={handleChange}
        >
            <Slider.Track className="relative block h-full w-full"></Slider.Track>
            <Slider.Thumb
                className={cn(
                    'block h-3 w-3 cursor-pointer rounded-full border-4 border-white',
                    cursorClassName
                )}
                style={{ boxShadow: '#0008 0 0 5px 0' }}
            />
        </Slider.Root>
    );
};
