import { Checkbox, Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Label } from '@diversifiedfinance/design-system/label';
import { Disclaimer } from '@diversifiedfinance/app/components/disclaimer';
import { useTranslation } from 'react-i18next';

export interface DisclaimerCheckboxProps {
	name: string;
	label: string;
	control: Control<any, any>;
	errorText?: string;
}

export default function DisclaimerCheckbox({
	name,
	label,
	control,
	errorText,
}: DisclaimerCheckboxProps) {
	const { t } = useTranslation();
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { value, onChange } }) => (
				<View>
					<View>
						<Text tw="font-bold text-gray-900 dark:text-white">
							{label}
						</Text>
					</View>
					<View tw="mt-3">
						<Disclaimer />
					</View>
					<View tw="mt-4 flex-row items-center">
						<Checkbox
							id={`checkbox-${name}`}
							onChange={onChange}
							checked={value}
							aria-label={name}
						/>
						<Label
							htmlFor={`checkbox-${name}`}
							tw="mx-4 flex-row items-center leading-5 text-black dark:text-white"
						>
							{t('I agree to the disclaimer')}
						</Label>
						{errorText && (
							<View tw="mx-4 my-2">
								<Text tw="text-gray-900 dark:text-white">
									{errorText}
								</Text>
							</View>
						)}
					</View>
				</View>
			)}
		/>
	);
}
