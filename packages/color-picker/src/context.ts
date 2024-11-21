import React from 'react';
import SuperColor, { SuperColorFormat } from 'super-color';

export interface ColorPickerContext {
    color: SuperColor;
    setColor: (color: SuperColor) => void;
    open: boolean;
    format: SuperColorFormat;
    setFormat: React.Dispatch<React.SetStateAction<SuperColorFormat>>;
    config: {
        disabled: boolean;
    };
}

const defaultContextValue: ColorPickerContext = {
    color: new SuperColor('#000000'),
    setColor: () => {},
    open: false,
    format: 'hex',
    setFormat: () => {},
    config: {
        disabled: false,
    },
};

export const colorPickerContext = React.createContext<ColorPickerContext>(defaultContextValue);
