import { yupResolver } from '@hookform/resolvers/yup';
import { yup } from '@diversifiedfinance/app/lib/yup';
import { Button } from '@diversifiedfinance/design-system/button';
import { Fieldset } from '@diversifiedfinance/design-system/fieldset';
import React, { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextInputProps } from 'react-native';

type FormData = {
	data?: string;
};

interface LoginInputFieldProps
	extends Pick<
		TextInputProps,
		'inputMode' | 'textContentType' | 'defaultValue' | 'autoComplete'
	> {
	label?: string;
	placeholder?: string;
	signInButtonLabel?: string;
	validationSchema?: yup.AnyObjectSchema;
	bottomElement?: React.ReactNode;
	leftElement?: React.ReactNode;
	textInputRef?: any;
	onSubmit: (value: string) => void;
	autoFocus?: boolean;
}

const INPUT_NAME = 'data';

export function LoginInputField({
	defaultValue = '',
	label = 'Input Field',
	placeholder = 'Enter here',
	signInButtonLabel = 'Sign in',
	inputMode = 'text',
	textContentType = 'none',
	validationSchema,
	leftElement,
	bottomElement,
	textInputRef,
	onSubmit,
	autoFocus,
	autoComplete,
}: LoginInputFieldProps) {
	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormData>({
		resolver: validationSchema ? yupResolver(validationSchema) : undefined,
		mode: 'onBlur',
		reValidateMode: 'onChange',
		defaultValues: {
			[INPUT_NAME]: defaultValue,
		},
	});
	const inputValue = watch(INPUT_NAME);
	//#endregion

	//#region callbacks
	const handleSubmitData = useCallback(
		({ data }: FormData) => {
			onSubmit(data ?? '');
		},
		[onSubmit]
	);

	//#endregion
	return (
		<>
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Fieldset
						defaultValue={defaultValue}
						label={label}
						onBlur={onBlur}
						autoFocus={autoFocus}
						onChangeText={onChange}
						placeholder={placeholder}
						//@ts-ignore
						ref={textInputRef}
						value={value}
						errorText={errors.data?.message}
						autoCapitalize="none"
						autoCorrect={false}
						autoComplete={autoComplete}
						inputMode={inputMode}
						textContentType={textContentType}
						leftElement={leftElement}
						returnKeyType="go"
						onSubmitEditing={handleSubmit(handleSubmitData)}
					/>
				)}
				name={INPUT_NAME}
			/>

			{bottomElement}

			<Button
				onPress={handleSubmit(handleSubmitData)}
				variant="primary"
				size="regular"
				tw={`mt-6 ${!inputValue ? 'opacity-60' : null}`}
				disabled={!inputValue}
			>
				{signInButtonLabel}
			</Button>
		</>
	);
}
