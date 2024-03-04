import { BirthDateInputField, minAgeDate } from './birth-date-input-field';
import { CountryOfResidenceInputField } from './country-of-residence-input-field';
import { NationalityInputField } from './nationality-input-field';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { yup } from '@diversifiedfinance/app/lib/yup';
import {
	MY_INFO_ENDPOINT,
	useMyInfo,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { Button } from '@diversifiedfinance/design-system/button';
import { Fieldset } from '@diversifiedfinance/design-system/fieldset';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo } from 'react';
import {
	Control,
	Controller,
	useForm,
	FormState,
	KeepStateOptions,
	SetValueConfig,
	FieldPathValue,
	UseFormGetValues,
} from 'react-hook-form';
import TermsAndConditionsCheckbox from './terms-and-conditions-checkbox';
import DisclaimerCheckbox from './disclaimer-checkbox';
import { LeadSourceField } from './lead-source-field';
import { useTranslation } from 'react-i18next';
import useSWRMutation from 'swr/mutation';
import { getLang } from '@diversifiedfinance/app/lib/i18n';
import { SponsorReferralCodeField } from './sponsor-referral-code-field';

export interface EditProfileContentProps {
	cta?: string;
	fields?: string[];
	onCompleted: () => void;
	hideIfTruthy?: string[];
}

const EditProfileField = ({
	fieldName,
	control,
	defaultValues,
	formState: { errors },
	reset,
	setValue,
	getValues,
}: {
	fieldName: string;
	control: Control;
	defaultValues: any;
	formState: FormState<any>;
	reset: (values?: any, keepStateOptions?: KeepStateOptions) => void;
	setValue: (
		name: string,
		value: FieldPathValue<any, string>,
		options?: SetValueConfig
	) => void;
	getValues: UseFormGetValues<any>;
}): JSX.Element | null => {
	const { t } = useTranslation();

	switch (fieldName) {
		case 'firstName':
			return (
				<View tw="mt-4">
					<Controller
						control={control}
						name="firstName"
						render={({ field: { onChange, onBlur, value } }) => (
							<Fieldset
								label={t('First Name')}
								placeholder={t('Eg: John')}
								value={value}
								textContentType="givenName"
								autoComplete="given-name"
								errorText={errors.firstName?.message?.toString()}
								onBlur={onBlur}
								onChangeText={onChange}
							/>
						)}
					/>
				</View>
			);
		case 'lastName':
			return (
				<View tw="mt-4">
					<Controller
						control={control}
						name="lastName"
						render={({ field: { onChange, onBlur, value } }) => (
							<Fieldset
								label={t('Last Name')}
								placeholder={t('Eg: Doe')}
								value={value}
								textContentType="familyName"
								autoComplete="family-name"
								errorText={errors.lastName?.message?.toString()}
								onBlur={onBlur}
								onChangeText={onChange}
							/>
						)}
					/>
				</View>
			);
		case 'email':
			return (
				<View tw="mt-4">
					<Controller
						control={control}
						name="email"
						render={({ field: { onChange, onBlur, value } }) => (
							<Fieldset
								autoCapitalize="none"
								label={t('E-mail')}
								placeholder={t('Eg: john.doe@domain.com')}
								value={value}
								textContentType="emailAddress"
								autoComplete="email"
								errorText={errors.email?.message?.toString()}
								onBlur={onBlur}
								onChangeText={onChange}
							/>
						)}
					/>
				</View>
			);
		case 'birthDate':
			return (
				<View tw="mt-4 z-10">
					<BirthDateInputField
						name="birthDate"
						label={t('Birth date')}
						placeholder={t('Eg: 15/04/1992')}
						control={control}
						errorText={errors.birthday?.message?.toString()}
					/>
				</View>
			);
		case 'nationality':
			return (
				<View tw="mt-4">
					<NationalityInputField
						name="nationality"
						label={t('Nationality')}
						placeholder={t('Select nationality')}
						control={control}
						errorText={errors.nationality?.message?.toString()}
					/>
				</View>
			);
		case 'countryOfResidence':
			return (
				<View tw="mt-4">
					<CountryOfResidenceInputField
						name="countryOfResidence"
						label={t('Country of residence')}
						placeholder={t('Select country')}
						control={control}
						errorText={errors.countryOfResidence?.message?.toString()}
					/>
				</View>
			);
		case 'disclaimerAccepted':
			const hasAcceptedDisclaimer = defaultValues.disclaimerAccepted;
			if (hasAcceptedDisclaimer) {
				return null;
			}
			return (
				<View tw="mt-4">
					<DisclaimerCheckbox
						name="disclaimerAccepted"
						label={t('Disclaimer')}
						control={control}
						errorText={errors.disclaimerAccepted?.message?.toString()}
					/>
				</View>
			);
		case 'termsAndConditionsAccepted':
			const hasAcceptedTerms = defaultValues.termsAndConditionsAccepted;
			if (hasAcceptedTerms) {
				return null;
			}
			return (
				<View tw="mt-4">
					<TermsAndConditionsCheckbox
						name="termsAndConditionsAccepted"
						control={control}
						errorText={errors.termsAndConditionsAccepted?.message?.toString()}
					/>
				</View>
			);
		case 'leadSource':
			if (Boolean(defaultValues.leadSource)) {
				// should be set once only
				return null;
			}
			return (
				<View tw="mt-4">
					<LeadSourceField
						name="leadSource"
						label={t('How did you hear about us?')}
						control={control}
						errorText={errors.leadSource?.message?.toString()}
					/>
				</View>
			);
		case 'sponsorReferralCode':
			if (Boolean(defaultValues.sponsorReferralCode)) {
				return null;
			}
			return (
				<SponsorReferralCodeField
					name="sponsorReferralCode"
					label={t('Do you have a referral code?')}
					control={control}
					placeholder={t('Enter your referral code here (if any)')}
					errorText={errors.sponsorReferralCode?.message?.toString()}
				/>
			);
		default:
			return null;
	}
};

async function updateUser(url: string, { arg: newValues }: { arg: any }) {
	return await axios({
		url,
		method: 'POST',
		data: newValues,
	});
}

export const EditProfileContent = ({
	cta,
	fields = [
		'firstName',
		'lastName',
		'birthDate',
		'nationality',
		'countryOfResidence',
		'disclaimerAccepted',
		'termsAndConditionsAccepted',
	],
	hideIfTruthy = ['email'],
	onCompleted,
}: EditProfileContentProps) => {
	const { t } = useTranslation();
	const { data: user } = useMyInfo();
	const { trigger, isMutating } = useSWRMutation(
		MY_INFO_ENDPOINT,
		updateUser
	);

	cta = cta ?? t('Update');

	const allFieldsSchema = useMemo(
		() =>
			yup.object({
				firstName: yup
					.string()
					.trim()
					.max(40)
					.required(t('Your first name is required')),
				lastName: yup
					.string()
					.trim()
					.max(40)
					.required(t('Your last name is required')),
				email: yup
					.string()
					.isEmail()
					.required(t('Your e-mail is required')),
				birthDate: yup
					.date()
					.max(
						minAgeDate,
						t('You need to be 18 to use the service.')
					),
				nationality: yup
					.string()
					.required(t('Your nationality is required')),
				countryOfResidence: yup
					.string()
					.required(t('Your country of residence is required')),
				disclaimerAccepted: yup
					.bool()
					.required(t('You must accept the disclaimer'))
					.oneOf([true], t('You must accept the disclaimer')),
				termsAndConditionsAccepted: yup
					.bool()
					.required(t('You must accept the terms and conditions'))
					.oneOf(
						[true],
						t('You must accept the terms and conditions')
					),
				leadSource: yup.string(),
				sponsorReferralCode: yup.string(),
			}),
		[t]
	);
	const allEditableFieldsFromProfile: Record<string, any> = useMemo(
		() => ({
			email: user?.data?.profile.email ?? '',
			firstName: user?.data?.profile.firstName ?? '',
			lastName: user?.data?.profile.lastName ?? '',
			birthDate: user?.data?.profile.birthDate,
			nationality: user?.data?.profile.nationality?.code ?? '',
			countryOfResidence:
				user?.data?.profile?.countryOfResidence?.code ?? 'FR',
			disclaimerAccepted: Boolean(
				user?.data?.profile?.disclaimerAccepted
			),
			termsAndConditionsAccepted: Boolean(
				user?.data?.profile?.termsAndConditionsAccepted
			),
			leadSource: user?.data?.profile?.leadSource ?? '',
			sponsorReferralCode: user?.data?.profile?.hasSponsor
				? 'XXXXXX'
				: '',
		}),
		[user?.data?.profile.updatedAt]
	);

	// dynamically generate schema from allFieldsTypes and fields prop
	const editProfileValidationSchema = useMemo(() => {
		const omittedFields = (hideIfTruthy ?? []).filter((field) =>
			Boolean(allEditableFieldsFromProfile[field])
		);
		return allFieldsSchema.pick(fields).omit(omittedFields);
	}, [fields, allEditableFieldsFromProfile]);

	const defaultValues = useMemo(
		() =>
			editProfileValidationSchema.cast(allEditableFieldsFromProfile, {
				stripUnknown: true,
			}),
		[editProfileValidationSchema, allEditableFieldsFromProfile]
	);

	const {
		control,
		handleSubmit,
		formState,
		reset,
		setValue,
		getValues,
		setError,
	} = useForm<any>({
		resolver: yupResolver(editProfileValidationSchema),
		mode: 'onBlur',
		reValidateMode: 'onChange',
		defaultValues,
	});

	const submitDisabled =
		!formState.isValid || formState.isSubmitting || isMutating;
	// TODO NEXT: handle user data change here, currently causes stack overlflow
	// useEffect(() => {
	// 	reset(defaultValues);
	// }, [reset, defaultValues]);

	const handleSubmitForm = async (newValues: any) => {
		try {
			await trigger({
				...newValues,
				locale: getLang(),
			});
			onCompleted?.();
		} catch (err) {
			if (Array.isArray(err.response?.data?.errors)) {
				err.response?.data?.errors.forEach((error) => {
					setError(error.field, {
						type: 'manual',
						message: error.message,
					});
				});
			} else {
				setError('root.server', {
					type: err.response?.statusCode ?? 'server',
					message: err.message,
				});
			}
		}
	};

	return (
		<View tw="mx-4">
			<View tw="flex-col">
				{Object.keys(editProfileValidationSchema.fields).map(
					(fieldName) => (
						<EditProfileField
							key={fieldName}
							fieldName={fieldName}
							control={control}
							defaultValues={defaultValues}
							formState={formState}
							reset={reset}
							setValue={setValue}
							getValues={getValues}
						/>
					)
				)}
			</View>
			<View tw="my-6">
				<Button
					size="regular"
					disabled={submitDisabled}
					tw={submitDisabled ? 'opacity-50' : ''}
					onPress={handleSubmit(handleSubmitForm)}
				>
					{formState.isSubmitting ? t('Submitting...') : cta}
				</Button>
				<View tw="h-1" />
				<Text tw="text-center text-sm text-red-500">
					{formState.errors.submitError?.message?.toString()}
				</Text>
			</View>
		</View>
	);
};

export default EditProfileContent;
