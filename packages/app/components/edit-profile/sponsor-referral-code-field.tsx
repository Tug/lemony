import { View } from '@diversifiedfinance/design-system';
import React from 'react';
import { Controller, Control, useWatch } from 'react-hook-form';
import { ActivationCodeField } from '@diversifiedfinance/app/components/login/activation-code-field';

interface SponsorReferralCodeFieldProps {
	label: string;
	name: string;
	placeholder?: string;
	control: Control<any, any>;
	errorText?: string;
}

export function SponsorReferralCodeField({
	name = 'sponsorReferralCode',
	label,
	placeholder,
	control,
	errorText,
}: SponsorReferralCodeFieldProps) {
	const leadSourceValue = useWatch({
		control,
		name: 'leadSource',
		exact: true,
	});

	if (
		// only show referral code field if lead source is one of the following
		![
			'ama',
			'word-of-mouth',
			'social',
			'newsletter',
			'podcast',
			'other',
		].includes(leadSourceValue) &&
		// leadSourceValue might not be part of the form in which case,
		// we always display the referral code field
		leadSourceValue !== undefined
	) {
		return null;
	}

	return (
		<View tw="mt-4">
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, onBlur, value } }) => (
					<ActivationCodeField
						label={label}
						placeholder={placeholder}
						value={value}
						errorText={errorText}
						onChange={onChange}
					/>
				)}
			/>
		</View>
	);
}
