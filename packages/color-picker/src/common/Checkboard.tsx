import React, { isValidElement } from 'react';

const checkboardCache: { [key: string]: string | null } = {};

export const render = (c1: string, c2: string, size: number) => {
    if (typeof document === 'undefined') {
        return null;
    }
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return null;
    } // If no context can be found, return early.
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, size, size);
    ctx.translate(size, size);
    ctx.fillRect(0, 0, size, size);
    return canvas.toDataURL();
};

export const get = (c1: string, c2: string, size: number) => {
    const key = `${c1}-${c2}-${size}`;

    if (checkboardCache[key]) {
        return checkboardCache[key];
    }

    const checkboard = render(c1, c2, size);
    checkboardCache[key] = checkboard;
    return checkboard;
};

interface CheckboardProps {
    white?: string;
    grey?: string;
    size?: number;
    children?: React.ReactNode;
}

export const Checkboard: React.FC<CheckboardProps> = ({
    white = 'transparent',
    grey = 'rgba(0,0,0,.08)',
    size = 8,
    children,
}) => {
    const gridStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        background: `url(${get(white as string, grey as string, size as number)}) center left`,
    };
    return isValidElement(children) ? (
        React.cloneElement(children, { ...children.props, style: gridStyle })
    ) : (
        <div style={gridStyle} />
    );
};
