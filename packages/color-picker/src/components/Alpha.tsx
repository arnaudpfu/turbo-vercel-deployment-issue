import { cn } from '@internalpackage/utils';
import * as Slider from '@radix-ui/react-slider';
import React, { useCallback, useContext, useMemo } from 'react';
import { Checkboard } from '../common/Checkboard';
import { colorPickerContext } from '../context';
import { StyleCSSProperties } from '../types';

interface AlphaProps {
    className?: string;
    cursorClassName?: string;
}

export const Alpha: React.FC<AlphaProps> = ({ className, cursorClassName }) => {
    const { color, setColor } = useContext(colorPickerContext);
    const rgb = useMemo(() => color.toRgba(), [color]);

    const styles: StyleCSSProperties = useMemo(() => {
        return {
            gradient: {
                background: `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b}, 0) 0%,
               rgba(${rgb.r},${rgb.g},${rgb.b}, 1) 100%)`,
            },
            pointer: {
                left: `${rgb.a * 100}%`,
            },
        };
    }, [color]);

    const handleChange = useCallback(
        ([alpha]: [number]) => {
            color.setAlpha(alpha * 0.01);
            setColor(color);
        },
        [setColor, color]
    );

    return (
        <Slider.Root
            className={cn('relative flex h-2 w-full items-center', className)}
            style={styles.gradient}
            value={[rgb.a * 100]}
            max={100}
            step={1}
            onValueChange={handleChange}
        >
            <Slider.Track className="relative block h-full w-full overflow-hidden">
                <Checkboard />
            </Slider.Track>
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
