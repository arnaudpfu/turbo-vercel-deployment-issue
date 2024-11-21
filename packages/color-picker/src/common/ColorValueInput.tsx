import React, { Component, PureComponent } from 'react';
import { SuperHexColor } from 'super-color';

interface ColorValueInputProps {
    label: string;
    slug: string;
    value: string;
    onChange: (value: { [type: string]: SuperHexColor | string | number }) => void;
    decimalValue?: boolean;
    max?: number;
    afterComma?: number;
    shape?: RegExp;
    isPercentage?: boolean;
}

interface ColorValueInputState {
    value: SuperHexColor | string | number;
}

const getNumberValue = (value: string): number => {
    let number: number;
    if (value.indexOf('%') !== -1) {
        number = Number((parseFloat(value.replace('%', '')) * 0.01).toFixed(2));
    } else {
        number = parseFloat(value);
    }
    return number;
};

let idCounter = 1;

export class ColorValueInput extends (PureComponent || Component)<
    ColorValueInputProps,
    ColorValueInputState
> {
    private readonly inputId: string;
    private input: HTMLInputElement | null;
    private readonly decimalValue: boolean;
    private readonly max: number;
    private readonly min: number;
    private readonly afterComma: number;
    private readonly shape: RegExp;
    private readonly isPercentage: boolean;

    constructor(props: ColorValueInputProps) {
        super(props);

        this.state = {
            value: String(props.value).toUpperCase(),
        };

        this.decimalValue = props.decimalValue !== undefined ? props.decimalValue : true;
        this.afterComma = props.afterComma !== undefined ? props.afterComma : 0;
        this.shape = props.shape !== undefined ? props.shape : /^\d*$/;
        this.isPercentage = props.isPercentage !== undefined ? props.isPercentage : false;
        this.max = props.max !== undefined ? props.max : 1;
        this.min = 0;

        this.input = null;
        this.inputId = `rc-editable-input-${idCounter++}`;
    }

    componentDidUpdate(prevProps: ColorValueInputProps, prevState: ColorValueInputState) {
        if (
            this.props.value !== this.state.value &&
            (prevProps.value !== this.props.value || prevState.value !== this.state.value)
        ) {
            if (this.input !== document.activeElement) {
                this.setState({
                    value: String(this.props.value).toUpperCase(),
                });
            }
        }
    }

    checkNumberRange(value: number): number {
        let n: number = value;
        if (value > this.max) {
            n = this.max;
        } else if (value < this.min) {
            n = this.min;
        }
        return n;
    }

    getValueObjectWithLabel(value: SuperHexColor | string | number) {
        return {
            [this.props.slug]: value,
        };
    }

    setUpdatedValue(value: string) {
        let colorValue: SuperHexColor | string | number = value;
        if (this.decimalValue && !/\.$/.test(value) && value !== '') {
            colorValue = this.checkNumberRange(getNumberValue(value));
        }
        const onChangeValue = this.getValueObjectWithLabel(colorValue);
        this.props.onChange(onChangeValue);
        this.setState({
            value: this.isPercentage ? Math.round((colorValue as number) * 100).toString() + '%' : colorValue,
        });
    }

    handleChange = (e: React.FormEvent) => {
        const inputValue = (e.target as HTMLInputElement).value;
        this.shape.test(inputValue) && this.setUpdatedValue(inputValue);
    };

    handleKeyDown = (e: React.KeyboardEvent) => {
        if (!this.decimalValue) {
            return;
        }

        const value = getNumberValue((e.target as HTMLInputElement).value);
        if (!isNaN(value)) {
            const afterComma = this.isPercentage ? 2 : this.afterComma;
            const offset = 10 ** -afterComma;
            let delta: -1 | 1 | 0 = 0;
            switch (e.key) {
                case 'ArrowUp':
                    delta = 1;
                    break;
                case 'ArrowDown':
                    delta = -1;
                    break;
            }
            const updatedValue = Number((value + delta * offset).toFixed(afterComma));

            delta !== 0 && this.setUpdatedValue(updatedValue.toString());
        }
    };

    handleWheel = (e: React.WheelEvent) => {
        if (!this.decimalValue) {
            return;
        }

        const value = getNumberValue((e.target as HTMLInputElement).value);
        if (!isNaN(value)) {
            const afterComma = this.isPercentage ? 2 : this.afterComma;
            const offset = 10 ** -afterComma;
            const delta = e.deltaY < 0 ? -1 : 1;
            const updatedValue = Number((value + delta * offset).toFixed(afterComma));

            e.deltaY !== 0 && this.setUpdatedValue(updatedValue.toString());
        }
    };

    render() {
        return (
            <div className="relative">
                <input
                    id={this.inputId}
                    // @ts-ignore
                    ref={((input) => (this.input = input)) as React.LegacyRef<HTMLInputElement> | undefined}
                    value={this.state.value}
                    onKeyDown={this.handleKeyDown}
                    onChange={this.handleChange}
                    onWheel={this.handleWheel}
                    spellCheck="false"
                    autoComplete="off"
                    type="text"
                    className="h-8 w-full rounded-md border bg-white text-center text-xs uppercase leading-4 outline-none transition"
                />
                <label
                    htmlFor={this.inputId}
                    className="text-muted-foreground mt-1 block text-center text-xs uppercase leading-4"
                >
                    {this.props.label}
                </label>
            </div>
        );
    }
}
