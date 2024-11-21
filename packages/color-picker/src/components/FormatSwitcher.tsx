import React, { useCallback, useContext } from 'react';
import { CgArrowsExchangeAltV } from 'react-icons/cg';
import { colorPickerContext } from '../context';

interface Props {}

export const FormatSwitcher: React.FC<Props> = () => {
    const { format, setFormat } = useContext(colorPickerContext);

    const toggleFormat = useCallback(() => {
        switch (format) {
            case 'hex':
                setFormat('rgb');
                break;
            case 'rgb':
                setFormat('hsl');
                break;
            case 'hsl':
                setFormat('hsv');
                break;
            default:
                setFormat('hex');
                break;
        }
    }, [format, setFormat]);

    return (
        <div
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center"
            onClick={toggleFormat}
        >
            <CgArrowsExchangeAltV />
        </div>
    );
};
