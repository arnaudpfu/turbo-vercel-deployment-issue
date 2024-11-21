import { throttle } from 'lodash';
import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { colorPickerContext } from '../context';
import { StyleCSSProperties } from '../types';

const calculateChange = (e: any, container: Element | null | undefined): { sValue: number; v: number } => {
    if (container === null || container === undefined) {
        throw new Error("The container does't exist.");
    }
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    const x = typeof e.pageX === 'number' ? e.pageX : e.touches[0].pageX;
    const y = typeof e.pageY === 'number' ? e.pageY : e.touches[0].pageY;
    let left = x - (container.getBoundingClientRect().left + window.pageXOffset);
    let top = y - (container.getBoundingClientRect().top + window.pageYOffset);

    if (left < 0) {
        left = 0;
    } else if (left > containerWidth) {
        left = containerWidth;
    }

    if (top < 0) {
        top = 0;
    } else if (top > containerHeight) {
        top = containerHeight;
    }

    const saturation = left / containerWidth;
    const bright = 1 - top / containerHeight;

    return { sValue: saturation, v: bright };
};

export const Saturation: React.FC = () => {
    const { color, setColor } = useContext(colorPickerContext);
    const hsv = useMemo(() => color.toHsva(), [color]);
    const h = useMemo(() => hsv.h, [hsv]);
    const sValue = useMemo(() => hsv.sValue, [hsv]);
    const v = useMemo(() => hsv.v, [hsv]);

    const handleSaturationChange = useCallback(
        (sValue: number, v: number) => {
            color.setHsv({ sValue, v });
            setColor(color);
        },
        [setColor, color]
    );

    const customThrottle = useMemo(
        () =>
            throttle((fn, sValue, v) => {
                fn(sValue, v);
            }, 50),
        []
    );
    const containerRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);
    const styles: StyleCSSProperties = useMemo(
        () => ({
            color: {
                background: `hsl(${h},100%, 50%)`,
            },
            pointer: {
                top: `${-(v * 100) + 100}%`,
                left: `${sValue * 100}%`,
            },
        }),
        [h, sValue, v]
    );

    const getContainerRenderWindow = useCallback(() => {
        let renderWindow = window as Window;
        while (
            containerRef.current !== null &&
            !renderWindow.document.contains(containerRef.current as Node) &&
            renderWindow.parent !== renderWindow
        ) {
            renderWindow = renderWindow.parent;
        }
        return renderWindow;
    }, []);

    const handleChange = useCallback(
        (e: MouseEvent | React.MouseEvent | React.TouchEvent) => {
            const { sValue, v } = calculateChange(e, containerRef.current);
            customThrottle(handleSaturationChange, sValue, v);
        },
        [handleSaturationChange, sValue, v, customThrottle]
    );

    const unbindEventListeners = useCallback(() => {
        console.log('mouse up');
        console.log('unbindEventListeners');
        const renderWindow = getContainerRenderWindow();
        const barrier = document.getElementById('color-picker-mouse-barrier');
        barrier && barrier.remove();
        renderWindow.removeEventListener('mousemove', handleChange);
        renderWindow.removeEventListener('mouseup', unbindEventListeners);
    }, [getContainerRenderWindow, handleChange]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            handleChange(e);
            const renderWindow = getContainerRenderWindow();
            const mouseBarrier = document.createElement('div');
            mouseBarrier.id = 'color-picker-mouse-barrier';
            mouseBarrier.setAttribute(
                'style',
                'position:absolute;top:0px;left:0px;width:100vw;height:100vh;z-index: 1;'
            );
            document.body.appendChild(mouseBarrier);
            renderWindow.addEventListener('mousemove', handleChange);
            renderWindow.addEventListener('mouseup', unbindEventListeners);
        },
        [getContainerRenderWindow, handleChange, unbindEventListeners]
    );

    // const handleMouseUp = useCallback(() => {
    //     unbindEventListeners();
    // }, [unbindEventListeners]);

    // useEffect(() => {
    //     return () => {
    //         customThrottle.cancel();
    //         unbindEventListeners();
    //     };
    // }, [customThrottle, unbindEventListeners]);

    return (
        <div
            style={{ paddingBottom: '55%' }}
            className="relative w-full overflow-hidden rounded-sm border shadow"
        >
            <div
                className="absolute inset-0 overflow-hidden"
                style={styles.color}
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchMove={handleChange}
                onTouchStart={handleChange}
            >
                <div
                    className="absolute inset-0 cursor-crosshair"
                    style={{
                        background: 'linear-gradient(to right, #fff, rgba(255, 255, 255, 0))',
                    }}
                >
                    <div
                        className="absolute inset-0 cursor-crosshair"
                        style={{
                            background: 'linear-gradient(to top, #000, rgba(0, 0, 0, 0))',
                        }}
                    />
                    <div style={styles.pointer} className="absolute z-10 cursor-crosshair">
                        <div
                            className="h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white mix-blend-difference"
                            style={{ boxShadow: 'black 0 0 5px 0' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
