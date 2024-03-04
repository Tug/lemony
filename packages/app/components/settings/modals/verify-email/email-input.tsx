import { yupResolver } from '@hookform/resolvers/yup';
import { yup } from '@diversifiedfinance/app/lib/yup';
import { BottomSheetTextInput } from '@diversifiedfinance/design-system/bottom-sheet';
import { Button } from '@diversifiedfinance/design-system/button';
import { Fieldset } from '@diversifiedfinance/design-system/fieldset';
import { Text } from '@diversifiedfinance/design-system/text';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

type FormData = {
	data?: string;
};

interface EmailInputProps
	extends Pick<TextInputProps, 'inputMode' | 'textContentType'> {
	label: string;
	placeholder: string;
	submitButtonLabel: string;
	onSubmit: (value: string) => void;
	defaultValue?: string;
}

export const EmailInput = (props: EmailInputProps) => {
	const { t } = useTranslation();
	const label = props.label;
	const onSubmit = props.onSubmit;
	const placeholder = props.placeholder;
	const inputMode = props.inputMode;
	const submitButtonLabel = props.submitButtonLabel;
	const textContentType = props.textContentType;

	const ref = useRef<typeof BottomSheetTextInput>();

	const emailValidationSchema = useMemo(
		() =>
			yup
				.object({
					data: yup
						.string()
						.email(t('Please enter a valid email address.'))
						.required(t('Please enter a valid email address.')),
				})
				.required(),
		[t]
	);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: yupResolver(emailValidationSchema),
		mode: 'onBlur',
		reValidateMode: 'onChange',
		defaultValues: {
			data: props.defaultValue,
		},
	});

	const handleSubmitData = useCallback(
		({ data }: FormData) => {
			onSubmit(data ?? '');
		},
		[onSubmit]
	);

	useEffect(() => {
		//@ts-ignore
		ref.current?.focus();
	}, []);

	return (
		<>
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Fieldset
						label={label}
						onChangeText={onChange}
						onBlur={onBlur}
						placeholder={placeholder}
						value={value}
						errorText={errors.data?.message}
						autoCapitalize="none"
						autoCorrect={false}
						inputMode={inputMode}
						textContentType={textContentType}
						returnKeyType="go"
						componentRef={ref}
					/>
				)}
				name="data"
			/>

			<Button
				onPress={handleSubmit(handleSubmitData)}
				variant="primary"
				size="regular"
				tw="mt-6"
			>
				{submitButtonLabel}
			</Button>
		</>
	);
};
