import SuperColor from 'super-color';

export type ColorPickerHandler = (color: SuperColor) => void;

export interface StyleCSSProperties {
    [cssClass: string]: React.CSSProperties;
}
