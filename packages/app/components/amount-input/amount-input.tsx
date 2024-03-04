import React, { ReactNode, forwardRef, memo, useMemo } from 'react';
import { Skeleton, Text, View } from '@diversifiedfinance/design-system';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Platform, StyleProp, TextInputProps, TextStyle } from 'react-native';
import {
	useIsDarkMode,
	useOnFocus,
} from '@diversifiedfinance/design-system/hooks';
import { useId } from '@diversifiedfinance/design-system/input';
import NumericTextInput, {
	NumericTextInputOptionsType,
} from '../numeric-text-input';
import debounce from 'lodash/debounce';
import Slider from '@react-native-community/slider';
import i18n from '@diversifiedfinance/app/lib/i18n';

export type AmountInputProps = NumericTextInputOptionsType & {
	tw?: string | string[];
	currencyImage: ReactNode;
	currencySymbol: string;
	currencyLabel?: string;
	currencyName: string;
	placeholder?: string;
	onChange?: (value: number) => void;
	value?: number;
	suffix?: string;
	isInvalid?: boolean;
	id?: string;
	disabled?: boolean;
	inputStyle?: StyleProp<TextStyle>;
	inputMode?: TextInputProps['inputMode'];
	extraInformation: ReactNode;
	isLoading?: boolean;
	withSlider?: boolean;
	minValueSlider?: number;
	maxValueSlider?: number;
	stepSlider?: number;
};

export const AmountInput = forwardRef((props: AmountInputProps, ref: any) => {
	const {
		tw,
		currencyImage,
		currencySymbol,
		currencyLabel,
		currencyName,
		decimalPlaces,
		useGrouping,
		placeholder,
		onChange,
		value,
		disabled,
		isInvalid,
		extraInformation,
		isLoading,
		withSlider,
		minValueSlider,
		maxValueSlider,
		stepSlider = 1,
	} = props;
	const { onFocus, onBlur, focused } = useOnFocus();
	const isDark = useIsDarkMode();
	const inputId = useId(props.id);
	const onChangeDebounced = useMemo(
		() => debounce(onChange, 100, { maxWait: 100 }),
		[onChange]
	);

	return (
		<View
			tw={[
				'w-full flex-col rounded-2xl transition-all duration-300 dark:bg-gray-900 border',
				...(Array.isArray(tw) ? tw : [tw ?? '']),
			]}
			style={{
				opacity: disabled ? 0.8 : 1,
				borderColor: isInvalid
					? colors.red[500]
					: colors.gray[isDark ? 800 : 200],
			}}
		>
			<View tw="flex-row items-center">
				<View tw="p-4">
					{isLoading ? (
						<Skeleton height={42} width={42} show={true} />
					) : (
						currencyImage
					)}
				</View>
				<View tw="shrink">
					{isLoading ? (
						<Skeleton height={20} width={50} show={true} />
					) : (
						<Text tw="mb-1 font-bold text-gray-900 dark:text-white">
							{currencyLabel ?? currencySymbol}
						</Text>
					)}
					{isLoading ? (
						<Skeleton height={20} width={110} show={true} />
					) : (
						<Text tw="text-xs font-bold text-gray-600 dark:text-white">
							{currencyName}
						</Text>
					)}
				</View>
				<View tw="grow p-4">
					<NumericTextInput
						type="decimal"
						currency={currencyLabel}
						decimalPlaces={decimalPlaces}
						useGrouping={useGrouping}
						locale={i18n.language}
						tw="justify-center p-1 text-xl font-inter font-bold text-gray-900 dark:text-white"
						style={[
							// @ts-ignore remove focus outline on web as we'll control the focus styling
							Platform.select({
								web: {
									outline: 'none',
								},
								default: undefined,
							}),
							{
								textAlign: 'right',
								textAlignVertical: 'top',
							},
						]}
						placeholderTextColor={
							isDark ? colors.gray['400'] : colors.gray['500']
						}
						value={value}
						onUpdate={onChangeDebounced}
						placeholder={placeholder}
						editable={!disabled}
						onFocus={onFocus}
						onBlur={onBlur}
						id={inputId}
						selectionColor={
							isDark ? colors.gray['300'] : colors.gray['700']
						}
						ref={ref}
						selectTextOnFocus
					/>
					<View tw="items-end">{extraInformation}</View>
				</View>
			</View>
			{withSlider && (
				<View tw="mx-4 mb-2">
					<Slider
						value={value}
						onValueChange={onChangeDebounced}
						style={{ width: '100%', height: 40 }}
						step={stepSlider}
						minimumValue={minValueSlider}
						maximumValue={maxValueSlider}
						minimumTrackTintColor={
							isDark ? colors.themeYellow : colors.diversifiedBlue
						}
						maximumTrackTintColor={
							isDark ? colors.gray[800] : colors.gray[200]
						}
						thumbTintColor={
							isDark ? colors.themeYellow : colors.diversifiedBlue
						}
					/>
				</View>
			)}
		</View>
	);
});
