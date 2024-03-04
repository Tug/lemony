import React, { useEffect } from 'react';
import { Fieldset, Image, View } from '@diversifiedfinance/design-system';
import { yup } from '@diversifiedfinance/app/lib/yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import {
	CARD_TYPES,
	formatCardNumber,
	formatCvc,
	formatExpiry,
	getCardNumberMaxLength,
	getCardTypeByValue,
	isCompleted,
	unformatCardNumber,
} from './utils';
import * as images from './images';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';

export type CreditCardInputCardType = (typeof CARD_TYPES)[number]['type'];

export interface CardDetails {
	expiry: string;
	last4: string;
	brand?: CreditCardInputCardType;
	postalCode: string;
	country: string;
	number: string;
	cvc: string;
	complete: boolean;
}

export interface CreditCardInputProps {
	onUpdate: (cardDetails: CardDetails) => void;
}

export default function CreditCardInput({ onUpdate }: CreditCardInputProps) {
	const { t } = useTranslation();
	const ccValidationSchema = yup.object({
		number: yup
			.string()
			.required()
			.label(t('Card number'))
			.matches(/^([ \d]{8,30})$/g, t('Invalid card number.')),
		expiry: yup
			.string()
			.label(t('expiry'))
			.typeError(t('Please enter a valid expiration date'))
			.required()
			.label(t('Expiration date')),
		cvc: yup
			.number()
			.required()
			.label(t('CVC'))
			.typeError(t('Please enter a valid CVC'))
			.min(0)
			.max(9999),
	});

	const {
		control,
		formState: { errors },
		reset,
		setValue,
		getValues,
		watch,
	} = useForm<any>({
		resolver: yupResolver(ccValidationSchema),
		mode: 'onBlur',
		reValidateMode: 'onSubmit',
	});

	useEffect(() => {
		const subscription = watch(
			debounce((values, { name, type }) => {
				const number = unformatCardNumber(values.number);
				const cvc = formatCvc(values.cvc);
				const expiry = formatExpiry(values.expiry);
				const complete = isCompleted({
					expiry,
					number,
					cvc,
				});
				const brand = getCardTypeByValue(values.number)?.type;
				onUpdate({
					expiry,
					number,
					cvc,
					complete,
					brand,
					last4: number.slice(-4),
					postalCode: '',
					country: '',
				});
			}, 500)
		);
		return () => subscription.unsubscribe();
	}, []);

	return (
		<View>
			<View tw="mt-4 flex-row">
				<Controller
					control={control}
					name="number"
					render={({ field: { onChange, onBlur, value } }) => {
						const cardType = getCardTypeByValue(value);
						const CardImage =
							images[cardType?.type] ?? images.placeholder;
						const cardImageElement =
							typeof CardImage === 'string' ? (
								<Image
									alt="card image"
									width={24}
									height={24}
									src={CardImage}
								/>
							) : (
								<CardImage width={24} height={24} />
							);
						return (
							<Fieldset
								leftElement={
									<View tw="ml-1 mr-2">
										{cardImageElement}
									</View>
								}
								tw="flex-1"
								label={t('Card Number')}
								placeholder="4242 4242 4242 4242"
								value={formatCardNumber(value)}
								inputMode="numeric"
								textContentType="creditCardNumber"
								errorText={errors.number?.message?.toString()}
								onBlur={onBlur}
								onChangeText={onChange}
								maxLength={getCardNumberMaxLength(value)}
							/>
						);
					}}
				/>
			</View>
			<View tw="my-4 w-full flex-row gap-x-3">
				<View tw="grow basis-0">
					<Controller
						control={control}
						name="expiry"
						render={({ field: { onChange, onBlur, value } }) => {
							return (
								<Fieldset
									label={t('Expiration date')}
									placeholder={t('MM / YY')}
									value={formatExpiry(value)}
									inputMode="numeric"
									errorText={errors.expiry?.message?.toString()}
									onBlur={onBlur}
									onChangeText={onChange}
									maxLength={7}
								/>
							);
						}}
					/>
				</View>
				<View tw="grow basis-0">
					<Controller
						control={control}
						name="cvc"
						render={({ field: { onChange, onBlur, value } }) => {
							const cardNumber = getValues('number');
							const cardType = getCardTypeByValue(cardNumber);
							return (
								<Fieldset
									label={t('CVC')}
									placeholder="123"
									value={formatCvc(value)}
									inputMode="numeric"
									errorText={errors.cvc?.message?.toString()}
									onBlur={onBlur}
									onChangeText={onChange}
									maxLength={cardType?.cvcLength ?? 3}
								/>
							);
						}}
					/>
				</View>
			</View>
		</View>
	);
}
