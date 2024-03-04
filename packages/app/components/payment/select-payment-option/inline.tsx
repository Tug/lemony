import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	ModalSheet,
	PressableScale,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import Edit from '@diversifiedfinance/design-system/icon/Edit';
import { useTranslation } from 'react-i18next';
import { PaymentOption } from './types';
import { SelectPaymentOption } from './index';
import { cardToString } from '@diversifiedfinance/app/lib/mangopay';
import { useCards } from '@diversifiedfinance/app/hooks/api-hooks';
import { usePreferredPaymentOption } from '@diversifiedfinance/app/hooks/use-preferred-payment-option';
import { isPaymentOptionValid } from '@diversifiedfinance/app/components/payment/select-payment-option/utils';
import type { PaymentMethod } from '../select-payment-method/types';

export interface SelectPaymentMethodInlineProps {
	selectedPaymentOption: PaymentOption | undefined;
	onChange: (paymentOption: PaymentOption | undefined) => void;
}

const paymentMethodSnapPoints = {
	applepay: [250, 300, '100%'],
	card: [320, '100%'],
	iban: [400, '100%'],
};

export function SelectPaymentOptionInline({
	selectedPaymentOption,
	onChange,
}: SelectPaymentMethodInlineProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const { data: cards } = useCards();
	const { preferredPaymentOption, setPreferredPaymentOption } =
		usePreferredPaymentOption();
	const [currentPaymentMethod, setCurrentPaymentMethod] =
		useState<PaymentMethod>(preferredPaymentOption?.paymentMethod);

	const getPaymentMethodLabel = ({
		paymentMethod,
		cardId,
	}: PaymentOption): string => {
		if (paymentMethod === 'applepay') {
			return t('Apple Pay');
		}
		if (paymentMethod === 'card') {
			const card = cards?.find(({ Id }) => Id === cardId);
			return cardToString(card);
		}
		if (paymentMethod === 'iban') {
			return t('IBAN transfer');
		}
		return '';
	};

	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [snapPoints, setSnapPoints] = useState(
		paymentMethodSnapPoints[currentPaymentMethod] ?? ['50%']
	);

	useEffect(() => {
		if (
			!selectedPaymentOption ||
			(selectedPaymentOption &&
				!isPaymentOptionValid(selectedPaymentOption, cards))
		) {
			if (__DEV__) {
				console.log(
					'Resetting payment option to',
					preferredPaymentOption
				);
			}
			// preferredPaymentOption is always valid (or undefined)
			onChange(preferredPaymentOption);
		}
	}, [cards, selectedPaymentOption, preferredPaymentOption, onChange]);

	useEffect(() => {
		setSnapPoints(paymentMethodSnapPoints[currentPaymentMethod] ?? ['50%']);
	}, [currentPaymentMethod]);

	return (
		<>
			<ModalSheet
				bodyStyle={{ height: '100%' }}
				snapPoints={snapPoints}
				title={t('Select Payment Method')}
				visible={modalVisible}
				close={() => setModalVisible(false)}
				onClose={() => {
					setCurrentPaymentMethod(
						selectedPaymentOption?.paymentMethod
					);
					setModalVisible(false);
				}}
			>
				<View tw="p-4">
					<SelectPaymentOption
						onPaymentMethodChange={setCurrentPaymentMethod}
						currentPaymentOption={selectedPaymentOption}
						onSelect={(newPaymentOption) => {
							onChange(newPaymentOption);
							setPreferredPaymentOption(newPaymentOption);
							setModalVisible(false);
						}}
					/>
				</View>
			</ModalSheet>
			<View tw="w-full flex-row items-center justify-between rounded-xl border border-gray-200 p-4">
				<View>
					<Text tw="text-gray-900 dark:text-gray-100">
						{t('Payment Method')}
					</Text>
				</View>
				<PressableScale onPress={() => setModalVisible(true)}>
					<View tw="flex-row items-center">
						<Text tw="font-bold text-black dark:text-white mr-2">
							{selectedPaymentOption
								? getPaymentMethodLabel(selectedPaymentOption)
								: t('Add Card')}
						</Text>
						<Edit
							width={16}
							height={16}
							color={isDark ? colors.white : colors.gray[900]}
						/>
					</View>
				</PressableScale>
			</View>
			{/*<View tw="mx-[35%] h-24">*/}
			{/*	<PoweredByMangopay style={{ width: '100%', height: '100%' }} />*/}
			{/*</View>*/}
		</>
	);
}
