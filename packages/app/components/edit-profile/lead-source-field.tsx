import { Select, Text, View } from '@diversifiedfinance/design-system';
import React, { useMemo } from 'react';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface LeadSourceFieldProps {
	label: string;
	name: string;
	placeholder?: string;
	control: Control<any, any>;
	onChange?: (newValue?: string) => void;
	errorText?: string;
}

export function LeadSourceField({
	name,
	label,
	control,
	errorText,
}: LeadSourceFieldProps) {
	const { t } = useTranslation();
	const placeholder = t('Select an option');
	const options = useMemo(
		() => [
			{
				label: t('App Store / Search Engine'),
				value: 'direct',
			},
			{
				label: t('Social Network'),
				value: 'social',
			},
			{
				label: t('Newsletter'),
				value: 'newsletter',
			},
			{
				label: t('Asset Manager Advisor'),
				value: 'ama',
			},
			{
				label: t('Podcast'),
				value: 'podcast',
			},
			{
				label: t('Word of Mouth'),
				value: 'word-of-mouth',
			},
			{
				label: t('Press'),
				value: 'press',
			},
			{
				label: t('Other'),
				value: 'other',
			},
		],
		[t]
	);
	return (
		<View>
			<View>
				<Text tw="font-bold text-gray-900 dark:text-white">
					{label}
				</Text>
			</View>
			<View tw="mt-3">
				<Controller
					control={control}
					name={name}
					render={({ field: { onChange, value } }) => (
						<Select
							placeholder={placeholder}
							options={options}
							value={value}
							onChange={onChange}
						/>
					)}
				/>
				{errorText && (
					<View tw="mx-4 my-2">
						<Text tw="text-gray-900 dark:text-white">
							{errorText}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}
