import React, { useCallback, useContext, useMemo } from 'react';
import { SuperHexColor } from 'super-color';
import { ColorValueInput } from '../common/ColorValueInput';
import { colorPickerContext } from '../context';

export const ColorFields: React.FC = () => {
    const { color, setColor, format } = useContext(colorPickerContext);
    const hex = useMemo(() => color.toHex(), [color]);
    const rgb = useMemo(() => color.toRgba(), [color]);
    const hsl = useMemo(() => color.toHsla(), [color]);
    const hsv = useMemo(() => color.toHsva(), [color]);

    const handleChange = useCallback(
        (data: { [type: string]: SuperHexColor | string | number }) => {
            const key = Object.keys(data)[0];
            const value = data[key];
            switch (key) {
                case 'hex':
                    if (/^#(([\dA-Fa-f]{3}){1,2}|([\dA-Fa-f]{4}){1,2})$/.test(value as SuperHexColor)) {
                        color.setHex(value as SuperHexColor);
                    }
                    break;
                case 'a':
                    const alphaString: string = typeof value === 'string' ? value : value.toString();
                    if (/^\d+(\.\d+)?$/.test(alphaString)) {
                        color.setAlpha(value as number);
                    }
                    break;
                case 'r':
                    color.setRgb({ r: value as number });
                    break;
                case 'g':
                    color.setRgb({ g: value as number });
                    break;
                case 'b':
                    color.setRgb({ b: value as number });
                    break;
                case 'h':
                    color.setHsl({ h: value as number });
                    break;
                case 'sLightness':
                    color.setHsl({ sLightness: value as number });
                    break;
                case 'l':
                    color.setHsl({ l: value as number });
                    break;
                case 'sValue':
                    color.setHsv({ sValue: value as number });
                    break;
                case 'v':
                    color.setHsv({ v: value as number });
                    break;
            }
            setColor(color);
        },
        [setColor, color]
    );

    const fields = useMemo(() => {
        switch (format) {
            case 'rgb':
                return (
                    <div className="-ml-[1.5] flex flex-1" key="rgb">
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="r"
                                slug="r"
                                value={rgb.r.toString()}
                                onChange={handleChange}
                                max={255}
                            />
                        </div>
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="g"
                                slug="g"
                                value={rgb.g.toString()}
                                onChange={handleChange}
                                max={255}
                            />
                        </div>
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="b"
                                slug="b"
                                value={rgb.b.toString()}
                                onChange={handleChange}
                                max={255}
                            />
                        </div>
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="a"
                                slug="a"
                                afterComma={2}
                                value={rgb.a.toString()}
                                onChange={handleChange}
                                max={1}
                                shape={/^\d*\.?\d*$/}
                            />
                        </div>
                    </div>
                );
            case 'hsl':
                return (
                    <div className="-ml-[1.5] flex flex-1" key="hsl">
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="h"
                                slug="h"
                                value={Math.round(hsl.h).toString()}
                                onChange={handleChange}
                                max={359}
                            />
                        </div>
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="s"
                                slug="sLightness"
                                value={`${Math.round(hsl.sLightness * 100)}%`}
                                onChange={handleChange}
                                shape={/^\d+%$/}
                                isPercentage={true}
                                max={1}
                            />
                        </div>
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="l"
                                slug="l"
                                value={`${Math.round(hsl.l * 100)}%`}
                                onChange={handleChange}
                                shape={/^\d+%$/}
                                isPercentage={true}
                                max={1}
                            />
                        </div>
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="a"
                                slug="a"
                                afterComma={2}
                                value={hsl.a.toString()}
                                onChange={handleChange}
                                max={1}
                                shape={/^\d*\.?\d*$/}
                            />
                        </div>
                    </div>
                );
            case 'hsv':
                return (
                    <div className="-ml-[1.5] flex flex-1" key="hsv">
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="h"
                                slug="h"
                                value={Math.round(hsv.h).toString()}
                                onChange={handleChange}
                                max={359}
                            />
                        </div>
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="s"
                                slug="sValue"
                                value={`${Math.round(hsv.sValue * 100)}%`}
                                onChange={handleChange}
                                shape={/^\d+%$/}
                                isPercentage={true}
                                max={1}
                            />
                        </div>
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="v"
                                slug="v"
                                value={`${Math.round(hsv.v * 100)}%`}
                                onChange={handleChange}
                                shape={/^\d+%$/}
                                isPercentage={true}
                                max={1}
                            />
                        </div>
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="a"
                                slug="a"
                                afterComma={2}
                                value={hsv.a.toString()}
                                onChange={handleChange}
                                max={1}
                                shape={/^\d*\.?\d*$/}
                            />
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="-ml-[1.5] flex flex-1" key="hex">
                        <div className="w-full pl-[1.5]">
                            <ColorValueInput
                                label="hex"
                                slug="hex"
                                value={hex}
                                onChange={handleChange}
                                decimalValue={false}
                                shape={/^(#([\dA-Fa-f]{0,8}))$/}
                            />
                        </div>
                    </div>
                );
        }
    }, [format, rgb, hsl, hsv, hex, handleChange]);

    return fields;
};
