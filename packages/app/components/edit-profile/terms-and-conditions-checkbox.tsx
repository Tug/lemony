import { Checkbox, Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { TextLink } from '../../navigation/link';
import { Label } from '@diversifiedfinance/design-system/label';
import { Trans, useTranslation } from 'react-i18next';

export interface TermsAndConditionsCheckboxProps {
	name: string;
	control: Control<any, any>;
	errorText?: string;
}
export default function TermsAndConditionsCheckbox({
	name,
	control,
	errorText,
}: TermsAndConditionsCheckboxProps) {
	const { t } = useTranslation();
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { value, onChange } }) => (
				<View tw="mb-2 mt-3 flex-row items-center">
					<Checkbox
						id={`checkbox-${name}`}
						onChange={onChange}
						checked={value}
						aria-label={name}
					/>
					<View tw="mx-4 flex-1 flex-row flex-wrap">
						<Label
							htmlFor={`checkbox-${name}`}
							tw="leading-5 text-black dark:text-white"
						>
							<Trans t={t}>
								I accept the{' '}
								<TextLink
									tw="font-bold underline"
									href={t(
										'https://diversified.fi/en-us/legals-hub'
									)}
								>
									terms and conditions
								</TextLink>{' '}
								and I have read the{' '}
								<TextLink
									tw="font-bold underline"
									href="https://diversified.fi/en-us/legals-hub?select-2"
								>
									confidentiality policy
								</TextLink>
							</Trans>
						</Label>
					</View>
					{errorText && (
						<View tw="mx-4 my-2">
							<Text tw="text-gray-900 dark:text-white">
								{errorText}
							</Text>
						</View>
					)}
				</View>
			)}
		/>
	);
}
