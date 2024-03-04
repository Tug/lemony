import { Fieldset, View } from '@diversifiedfinance/design-system';
import React, { useMemo } from 'react';
import { yup } from '@diversifiedfinance/app/lib/yup';
import { useTranslation } from 'react-i18next';
import { Control, FormState, useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useBankAccounts } from '@diversifiedfinance/app/hooks/api-hooks';

const isEuropeanCountryCode = (country: string) =>
	[
		'AT',
		'BE',
		'BG',
		'HR',
		'CY',
		'CZ',
		'DK',
		'EE',
		'FI',
		'FR',
		'DE',
		'EL',
		'HU',
		'IE',
		'IT',
		'LV',
		'LT',
		'LU',
		'MT',
		'PL',
		'PT',
		'RO',
		'SK',
		'SI',
		'ES',
		'SE',
		'NL',
	].includes(country);

export interface EditIbanFieldsProps {
	formState: FormState<any>;
	control: Control<any>;
}

export const EditIbanFields = ({ control, formState }: EditIbanFieldsProps) => {
	const { t } = useTranslation();

	return (
		<View tw="flex-col">
			<View tw="my-2">
				<Controller
					control={control}
					name="iban"
					render={({ field: { onChange, onBlur, value } }) => (
						<Fieldset
							label={t('IBAN')}
							placeholder={'IBAN'}
							value={value}
							textContentType="name"
							errorText={formState.errors.iban?.message?.toString()}
							onBlur={onBlur}
							onChangeText={onChange}
						/>
					)}
				/>
			</View>
			<View tw="my-2">
				<Controller
					control={control}
					name="bic"
					render={({ field: { onChange, onBlur, value } }) => (
						<Fieldset
							label={t('BIC')}
							placeholder={t('BIC / SWIFT Code')}
							value={value}
							textContentType="name"
							errorText={formState.errors.bic?.message?.toString()}
							onBlur={onBlur}
							onChangeText={onChange}
						/>
					)}
				/>
			</View>
			<View tw="my-2">
				<Controller
					control={control}
					name="label"
					render={({ field: { onChange, onBlur, value } }) => (
						<Fieldset
							label={t('Label (Optional)')}
							placeholder={t('Give this account a name')}
							value={value}
							textContentType="name"
							errorText={formState.errors.label?.message?.toString()}
							onBlur={onBlur}
							onChangeText={onChange}
						/>
					)}
				/>
			</View>
		</View>
	);
};

export const useIBANSchema = () => {
	const { t } = useTranslation();
	return useMemo(
		() =>
			yup.object({
				iban: yup
					.string()
					.iban(t('Invalid IBAN'))
					.test(
						'is-european-iban',
						t('Only european accounts are allowed at the moment'),
						(value) =>
							isEuropeanCountryCode(
								value.slice(0, 2).toUpperCase()
							)
					)
					.required(t('IBAN is required')),
				bic: yup.string().trim().max(40).required(t('BIC is required')),
				label: yup.string().optional(),
			}),
		[t]
	);
};

export const useIBANDefaultValues = () => ({
	iban: '',
	bic: '',
	label: '',
});

export default function useEditIbanFields({
	onCompleted,
}: {
	onCompleted?: () => void;
} = {}) {
	const defaultValues = useIBANDefaultValues();
	const ibanSchema = useIBANSchema();
	const { addBankAccount } = useBankAccounts();

	const { control, handleSubmit, formState, reset } = useForm<any>({
		resolver: yupResolver(ibanSchema),
		mode: 'onBlur',
		reValidateMode: 'onChange',
		defaultValues,
	});
	const canSubmit = !formState.isSubmitting && formState.isValid;

	const onSubmit = handleSubmit(async (bankAccountInfo: any) => {
		try {
			await addBankAccount(bankAccountInfo);
			onCompleted?.();
		} catch (err) {
			reset();
		}
	});

	const editIbanFields = useMemo(
		() => <EditIbanFields control={control} formState={formState} />,
		[control, formState]
	);

	return {
		control,
		handleSubmit,
		formState,
		reset,
		canSubmit,
		editIbanFields,
		onSubmit,
	};
}
