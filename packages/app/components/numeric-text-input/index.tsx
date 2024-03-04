import React, { PureComponent } from 'react';
import { code } from 'currency-codes';

// Polyfill for Intl until properly supported in Android
import 'intl';
import 'intl/locale-data/jsonp/en';
// import 'intl/locale-data/jsonp/fr';
import {
	TextInput,
	TextInputProps,
} from '@diversifiedfinance/design-system/text-input';

type NumericTextInputType = 'currency' | 'decimal';

export type NumericTextInputOptionsType = {
	currency?: string;
	decimalPlaces?: number;
	useGrouping?: boolean;
};

type NumericTextInputProps = Omit<TextInputProps, 'value'> &
	NumericTextInputOptionsType & {
		locale?: string;
		onUpdate: (value?: number) => void;
		type?: NumericTextInputType;
		value?: number;
		caretHidden?: boolean;
		// minimumFractionDigits?: number;
		// maximumFractionDigits?: number;
	};

type NumberFormatConfig = {
	divisor: number;
	style: NumericTextInputType;
	locale: string;
	minimumFractionDigits?: number;
	useGrouping?: boolean;
	// maximumFractionDigits: number;
};

class NumericTextInput extends PureComponent<NumericTextInputProps> {
	formatConfig: NumberFormatConfig;

	constructor(props: NumericTextInputProps) {
		super(props);

		this.formatConfig = this.createFormatConfig();
	}

	createFormatConfig(): NumberFormatConfig {
		let {
			locale = 'en-US',
			type = 'decimal',
			useGrouping = true,
			decimalPlaces = 0,
		} = this.props;
		const typeOptions = {};

		if (type === 'currency') {
			const { currency = 'EUR' } = this.props;

			typeOptions.currency = currency;
			decimalPlaces = code(currency).digits;
		} else {
			typeOptions.maximumFractionDigits = decimalPlaces;
			typeOptions.minimumFractionDigits = decimalPlaces;
		}

		return {
			...typeOptions,
			locale,
			style: type,
			useGrouping,
			divisor: Math.pow(10, decimalPlaces),
		};
	}

	formatNumberValue(
		numberValue: number | undefined,
		numberFormatConfig: NumberFormatConfig
	): string {
		let returnValue = '';

		if (numberValue) {
			const { locale, ...config } = numberFormatConfig;

			returnValue = new Intl.NumberFormat(locale, config).format(
				numberValue
			);
		}

		return returnValue;
	}

	parseStringValue(
		text: string,
		numberFormatConfig: NumberFormatConfig
	): number | undefined {
		const digitsOnly = text.match(/\d+/g);

		return digitsOnly
			? parseInt(digitsOnly.join(''), 10) / numberFormatConfig.divisor
			: undefined;
	}

	onUpdate = (text: string) => {
		const { onUpdate } = this.props;
		const parsedValue = this.parseStringValue(text, this.formatConfig);

		onUpdate?.(parsedValue);
	};

	render() {
		const { onUpdate, value, ...textInputProps } = this.props;

		return (
			<TextInput
				{...textInputProps}
				value={this.formatNumberValue(value, this.formatConfig)}
				inputMode="numeric"
				onChangeText={this.onUpdate}
			/>
		);
	}
}

export default NumericTextInput;
