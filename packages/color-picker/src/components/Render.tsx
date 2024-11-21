import { cn } from '@internalpackage/utils';
import React, { useContext, useMemo } from 'react';
import { Checkboard } from '../common/Checkboard';
import { colorPickerContext } from '../context';

interface Props {
    className?: string;
}

export const Render: React.FC<Props> = ({ className }) => {
    const { color } = useContext(colorPickerContext);

    const renderNotice: React.CSSProperties = useMemo(() => {
        const rgb = color.toRgba();
        return {
            background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`,
        };
    }, [color]);

    return (
        <div className={cn('relative h-5 w-5 overflow-hidden rounded-full shadow', className)}>
            <div style={renderNotice} className="z-2 absolute inset-0" />
            <Checkboard />
        </div>
    );
};
