import { CountryOfResidenceInputField } from '../edit-profile/country-of-residence-input-field';
import { Fieldset } from '@diversifiedfinance/design-system/fieldset';
import { View } from '@diversifiedfinance/design-system/view';
import React, { useMemo } from 'react';
import {
	Control,
	Controller,
	FormState,
	useForm,
	UseFormWatch,
} from 'react-hook-form';
import { yup } from '@diversifiedfinance/app/lib/yup';
import { useTranslation } from 'react-i18next';
import {
	MY_INFO_ENDPOINT,
	useMyInfo,
} from '@diversifiedfinance/app/hooks/api-hooks';
import type { Address } from '@diversifiedfinance/types/diversified';
import { yupResolver } from '@hookform/resolvers/yup';
import useSWRMutation from 'swr/mutation';
import { axios } from '@diversifiedfinance/app/lib/axios';
import useUpdateEffect from '@diversifiedfinance/app/hooks/use-update-effect';

type AddressForm = Address & { country: string };

export interface EditAddressFieldsProps {
	name: string;
	formState: FormState<AddressForm>;
	control: Control<AddressForm>;
	watch: UseFormWatch<AddressForm>;
	setValue: any;
}

// see https://mangopay.com/docs/endpoints/payouts#create-iban-bank-account
export const isRegionRequired = (countryCode: string) =>
	['US', 'MX', 'CA'].includes(countryCode);

export const useAddressSchema = () => {
	const { t } = useTranslation();
	return useMemo(
		() =>
			yup.object({
				addressLine1: yup
					.string()
					.required(t('Street information is required')),
				addressLine2: yup.string().notRequired().nullable(),
				city: yup.string().required(t('City is required')),
				region: yup.string().when('country', {
					is: (country: string) => isRegionRequired(country),
					then: (regionSchema) =>
						regionSchema.required(t('Region is required')),
				}),
				postalCode: yup.string(),
				country: yup.string().required(t('Country is required')),
			}),
		[t]
	);
};

export const useAddressDefaultValues = () => {
	const { data: user } = useMyInfo();
	const defaultCountryCode =
		user?.data?.profile.address?.country.code ??
		user?.data?.profile.countryOfResidence?.code;
	return useMemo(
		() => ({
			addressLine1: user?.data?.profile.address?.addressLine1 || '',
			addressLine2: user?.data?.profile.address?.addressLine2 || '',
			city: user?.data?.profile.address?.city || '',
			region: user?.data?.profile.address?.region || '',
			postalCode: user?.data?.profile.address?.postalCode || '',
			country: defaultCountryCode,
		}),
		[user?.data?.profile, defaultCountryCode]
	);
};

export const EditAddressFields = ({
	name,
	watch,
	control,
	formState,
	setValue,
}: EditAddressFieldsProps) => {
	const { t } = useTranslation();
	const prefix = name ? `${name}.` : '';

	// on country change, re-render to display/hide region field
	const currentCountry = watch(`${prefix}country`);
	const showRegion = isRegionRequired(currentCountry);

	// reset region on country change
	useUpdateEffect(() => {
		setValue(`${prefix}region`, '');
	}, [currentCountry, prefix]);

	return (
		<View tw="flex-col">
			<View tw="my-2">
				<View tw="my-2">
					<View>
						<Controller
							control={control}
							name={`${prefix}addressLine1`}
							render={({
								field: { onChange, onBlur, value, ref },
							}) => (
								<Fieldset
									ref={ref}
									label={t('Street')}
									placeholder={t('Address Line 1')}
									value={value}
									textContentType="streetAddressLine1"
									errorText={formState.errors.addressLine1?.message?.toString()}
									onBlur={onBlur}
									onChangeText={onChange}
								/>
							)}
						/>
					</View>
					<View tw="mt-3">
						<Controller
							control={control}
							name={`${prefix}addressLine2`}
							render={({
								field: { onChange, onBlur, value, ref },
							}) => (
								<Fieldset
									ref={ref}
									label={''}
									placeholder={t('Address Line 2')}
									value={value}
									textContentType="streetAddressLine2"
									errorText={formState.errors.addressLine2?.message?.toString()}
									onBlur={onBlur}
									onChangeText={onChange}
								/>
							)}
						/>
					</View>
				</View>
				<View tw="my-2 flex-row w-full">
					<View tw="basis-1/3">
						<Controller
							control={control}
							name={`${prefix}postalCode`}
							render={({
								field: { onChange, onBlur, value, ref },
							}) => (
								<Fieldset
									ref={ref}
									label={t('Postal Code')}
									placeholder={t('Postal Code')}
									value={value}
									textContentType="postalCode"
									errorText={formState.errors.postalCode?.message?.toString()}
									onBlur={onBlur}
									onChangeText={onChange}
								/>
							)}
						/>
					</View>
					<View tw="ml-2 basis-2/3 grow shrink">
						<Controller
							control={control}
							name={`${prefix}city`}
							render={({
								field: { onChange, onBlur, value, ref },
							}) => (
								<Fieldset
									ref={ref}
									label={t('City')}
									placeholder={t('City')}
									value={value}
									textContentType="addressCity"
									errorText={formState.errors.city?.message?.toString()}
									onBlur={onBlur}
									onChangeText={onChange}
								/>
							)}
						/>
					</View>
				</View>
				{showRegion && (
					<View tw="my-2">
						<Controller
							control={control}
							name={`${prefix}region`}
							render={({
								field: { onChange, onBlur, value, ref },
							}) => (
								<Fieldset
									ref={ref}
									label={t('Region')}
									placeholder={t('Region')}
									value={value}
									textContentType="addressState"
									errorText={formState.errors.region?.message?.toString()}
									onBlur={onBlur}
									onChangeText={onChange}
								/>
							)}
						/>
					</View>
				)}
				<View tw="my-2">
					<CountryOfResidenceInputField
						label={t('Country')}
						name={`${prefix}country`}
						placeholder={t('Select country')}
						control={control}
						errorText={formState.errors.country?.message?.toString()}
					/>
				</View>
			</View>
		</View>
	);
};

async function updateUserAddress(
	url: string,
	{ arg: newValues }: { arg: any }
) {
	return await axios({
		url,
		method: 'POST',
		data: {
			address: newValues,
		},
	});
}

export default function useEditAddressFields({
	onCompleted,
}: {
	onCompleted?: () => void;
} = {}) {
	const defaultValues = useAddressDefaultValues();
	const addressSchema = useAddressSchema();
	const {
		watch,
		control,
		handleSubmit,
		formState,
		reset,
		setValue,
		setError,
	} = useForm<typeof defaultValues>({
		resolver: yupResolver(addressSchema),
		mode: 'onBlur',
		reValidateMode: 'onChange',
		shouldFocusError: true,
		defaultValues,
		resetOptions: {
			keepDirtyValues: true,
			keepErrors: true,
		},
	});
	const { trigger, isMutating } = useSWRMutation(
		MY_INFO_ENDPOINT,
		updateUserAddress
	);
	const canSubmit =
		formState.isValid && !formState.isSubmitting && !isMutating;

	const handleSubmitForm = async (address: Address) => {
		try {
			await trigger(address);
			onCompleted?.();
		} catch (err) {
			reset();
		}
	};

	const onSubmit = handleSubmit(handleSubmitForm);

	const editAddressFields = useMemo(
		() => (
			<EditAddressFields
				watch={watch}
				control={control}
				formState={formState}
				setValue={setValue}
			/>
		),
		[watch, control, formState, setValue]
	);

	return {
		watch,
		control,
		handleSubmit,
		formState,
		reset,
		setError,
		canSubmit,
		editAddressFields,
		onSubmit,
	};
}
