import { Pressable, Text, View } from '@diversifiedfinance/design-system';
import { DateTimePicker } from '@diversifiedfinance/design-system/date-time-picker';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import React, { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Platform } from 'react-native';
import i18n from '@diversifiedfinance/app/lib/i18n';

const oldestPersonEver = 123;
const majorityAgeDefault = 18;
export const maxAgeDate = new Date(
	Date.now() - oldestPersonEver * 365.25 * 24 * 3600 * 1000
);
export const minAgeDate = new Date(
	Date.now() - majorityAgeDefault * 365.25 * 24 * 3600 * 1000
);

interface BirthDateInputFieldProps {
	label: string;
	name: string;
	placeholder?: string;
	control: Control<any, any>;
	errorText?: string;
}

const INPUT_NAME = 'data';

export function BirthDateInputField({
	name,
	label,
	placeholder = '',
	control,
	errorText,
}: BirthDateInputFieldProps) {
	const [showDatePicker, setShowDatePicker] = useState(false);
	const isDark = useIsDarkMode();
	return (
		<>
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, onBlur, value } }) => {
					const dateValue =
						typeof value === 'string' &&
						!isNaN(new Date(value).getTime())
							? new Date(value)
							: value ?? undefined;

					return (
						<View>
							{Platform.OS !== 'web' ? (
								<Pressable
									onPress={() => {
										setShowDatePicker(!showDatePicker);
									}}
								>
									<Text tw="font-bold text-gray-900 dark:text-white">
										{label}
									</Text>
									<View tw="mt-3 h-12 justify-center rounded-full bg-gray-100 p-4 dark:bg-gray-900">
										{dateValue && (
											<Text tw="text-base text-gray-900 dark:text-white">
												{new Intl.DateTimeFormat(
													i18n.language
												).format(dateValue)}
											</Text>
										)}
										{!dateValue && (
											<Text
												tw="text-base text-gray-900 dark:text-white"
												style={{
													color: isDark
														? colors.gray[400]
														: colors.gray[600],
												}}
											>
												{placeholder}
											</Text>
										)}
									</View>
								</Pressable>
							) : (
								<Text tw="font-bold text-gray-900 dark:text-white">
									Birth date
								</Text>
							)}

							<View tw="t-0 l-0 w-full flex-row">
								<DateTimePicker
									onChange={(v) => {
										onChange(v);
										setShowDatePicker(false);
									}}
									minimumDate={maxAgeDate}
									maximumDate={minAgeDate}
									value={dateValue ?? minAgeDate}
									type="date"
									open={showDatePicker}
								/>
							</View>
						</View>
					);
				}}
			/>
		</>
	);
}
