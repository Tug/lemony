import { yup } from '@diversifiedfinance/app/lib/yup';
import { Fieldset } from '@diversifiedfinance/design-system/fieldset';
import React, { useState } from 'react';
import { TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ActivationCodeFieldProps
	extends Pick<TextInputProps, 'inputMode' | 'textContentType'> {
	label?: string;
	placeholder?: string;
	validationSchema?: yup.AnyObjectSchema;
	leftElement?: React.ReactNode;
	textInputRef?: any;
	value: string;
	onChange: (text: string) => void;
	disabled: boolean;
	errorText?: string;
}

export function ActivationCodeField({
	label,
	placeholder = 'Enter your activation code',
	inputMode = 'text',
	textContentType = 'none',
	leftElement,
	textInputRef,
	value = '',
	onChange,
	disabled = false,
	errorText,
}: ActivationCodeFieldProps) {
	const { t } = useTranslation();

	return (
		<Fieldset
			label={label}
			onChangeText={onChange}
			placeholder={placeholder}
			ref={textInputRef}
			value={value}
			autoCapitalize="characters"
			autoCorrect={false}
			inputMode={inputMode}
			textContentType={textContentType}
			leftElement={leftElement}
			disabled={disabled}
			errorText={errorText}
		/>
	);
}
