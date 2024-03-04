import { Image } from '@diversifiedfinance/design-system';
import React, { ReactNode } from 'react';
import { AmountInput } from './amount-input';
import type { AmountInputProps } from './amount-input';

const DIFIED = () => (
	<Image
		source={require('./DIFIED.png')}
		tw="rounded-md"
		width={42}
		height={42}
		alt="DIFIED"
	/>
);

const EUR = () => (
	<Image
		source={require('./EUR.png')}
		tw="rounded-md"
		width={42}
		height={42}
		alt="EUR"
	/>
);

export type SimpleAmountInputProps = Pick<
	AmountInputProps,
	'tw' | 'value' | 'onChange'
> & {
	currency: 'EUR' | 'DIFIED';
	currencyName?: string;
	currencySymbol?: string;
	currencyLabel?: string;
	extraInformation?: ReactNode;
	decimalPlaces?: number;
	isLoading?: boolean;
	disabled?: boolean;
	withSlider?: boolean;
	minValueSlider?: number;
	maxValueSlider?: number;
};

export function SimpleAmountInput({
	tw,
	currency,
	value,
	onChange,
	currencyName,
	currencySymbol,
	currencyLabel,
	extraInformation,
	decimalPlaces,
	isLoading = false,
	disabled = false,
	withSlider = false,
	minValueSlider,
	maxValueSlider,
}: SimpleAmountInputProps) {
	switch (currency) {
		case 'EUR':
			return (
				<AmountInput
					tw={tw}
					currencySymbol="EUR"
					currencyLabel={currencyLabel}
					currencyName="Euros"
					currencyImage={<EUR />}
					decimalPlaces={decimalPlaces ?? 2}
					value={value}
					onChange={onChange}
					placeholder="00.00"
					extraInformation={extraInformation}
					isLoading={isLoading}
					disabled={disabled}
					withSlider={withSlider}
					minValueSlider={minValueSlider}
					maxValueSlider={maxValueSlider}
					stepSlider={10}
				/>
			);
		case 'DIFIED':
			return (
				<AmountInput
					tw={tw}
					currencySymbol={currencySymbol ?? 'DIFIED'}
					currencyLabel={currencyLabel}
					currencyName={currencyName ?? 'Diversified Tokens'}
					currencyImage={<DIFIED />}
					decimalPlaces={decimalPlaces ?? 4}
					value={value}
					onChange={onChange}
					placeholder="0.000"
					extraInformation={extraInformation}
					isLoading={isLoading}
					disabled={disabled}
					withSlider={withSlider}
					minValueSlider={minValueSlider}
					maxValueSlider={maxValueSlider}
					stepSlider={1}
				/>
			);
	}
}

export { AmountInput, AmountInputProps };
