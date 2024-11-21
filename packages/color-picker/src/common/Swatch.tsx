import React from 'react';
import { Checkboard } from './Checkboard';

interface OptionalEvents {
    onMouseOver?: (e: React.MouseEvent) => void;
}

interface SwatchProps {
    color?: string;
    style?: React.CSSProperties;
    onClick?: (color: string, e: React.SyntheticEvent) => void;
    onHover?: (color: string, e: React.SyntheticEvent) => void;
    title?: string;
    children?: React.ReactNode;
    focus?: boolean;
    focusStyle?: React.CSSProperties;
}

export const handleFocus = (Component: React.ComponentType<SwatchProps>) =>
    class Focus extends React.Component {
        state = { focus: false };
        handleFocus = () => this.setState({ focus: true });
        handleBlur = () => this.setState({ focus: false });

        render() {
            return (
                <span onFocus={this.handleFocus} onBlur={this.handleBlur}>
                    <Component {...this.props} {...this.state} />
                </span>
            );
        }
    };

const ENTER = 13;

export const Swatch: React.FC<SwatchProps> = ({
    color,
    style,
    onClick = () => {},
    onHover,
    title = color,
    children,
    focus,
    focusStyle = {},
}) => {
    const transparent = color === 'transparent';
    const stylesSwatch: React.CSSProperties = {
        background: color,
        height: '100%',
        width: '100%',
        cursor: 'pointer',
        position: 'relative',
        outline: 'none',
        ...style,
        ...(focus ? focusStyle : {}),
    };

    const handleClick = (e: React.MouseEvent) => onClick(color || '', e);
    const handleKeyDown = (e: React.KeyboardEvent) => e.keyCode === ENTER && onClick(color || '', e);

    const optionalEvents: OptionalEvents = {};
    if (onHover) {
        optionalEvents.onMouseOver = (e: React.MouseEvent) => onHover(color || '', e);
    }

    return (
        <div
            style={stylesSwatch}
            onClick={handleClick}
            title={title}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            {...optionalEvents}
        >
            {children}
            {transparent && <Checkboard />}
        </div>
    );
};

export default handleFocus(Swatch);
