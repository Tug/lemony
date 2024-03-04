import React, { useEffect, useState } from 'react';
import { Button, Text, View } from '@diversifiedfinance/design-system';
import { PressableHover } from '@diversifiedfinance/design-system/pressable-hover';
import Bank from '@diversifiedfinance/design-system/icon/Bank';
import CreditCard from '@diversifiedfinance/design-system/icon/CreditCard';
import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import SvgApple from '@diversifiedfinance/design-system/icon/Apple';
import { useFeature } from '@growthbook/growthbook-react';
import { Platform } from 'react-native';
import { PickCard } from '@diversifiedfinance/app/components/payment/pick-card';
import { useTranslation } from 'react-i18next';
import { PaymentOption } from './types';
import { IBANPayment } from '@diversifiedfinance/app/components/payment/select-payment-method/iban-payment';
import { useCards } from '@diversifiedfinance/app/hooks/api-hooks';
import { useNavigateToModalScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

export interface SelectPaymentOptionProps {
	currentPaymentOption?: PaymentOption;
	onSelect: (paymentOption: PaymentOption | undefined) => void;
	onPaymentMethodChange: (paymentMethod: string) => void;
}

export function SelectPaymentOption({
	currentPaymentOption,
	onSelect,
	onPaymentMethodChange,
}: SelectPaymentOptionProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const awaitForModal = useNavigateToModalScreen();
	const applepayEnabled = Platform.OS === 'ios';
	const { activeCard, data: cards, isLoading: isCardLoading } = useCards();
	const defaultPaymentMethod = applepayEnabled ? 'applepay' : 'card';
	const [selectedPaymentMethod, selectPaymentMethod] = useState(
		currentPaymentOption?.paymentMethod ?? defaultPaymentMethod
	);
	const [selectedCardId, setSelectedCardId] = useState<string | null>(
		currentPaymentOption?.cardId ?? null
	);

	const onCardSelect = async (cardId?: string | null) => {
		if (cardId) {
			onSelect({
				paymentMethod: selectedPaymentMethod,
				cardId,
			});
			return;
		}
		if (!isCardLoading && cards && cards.length === 0) {
			await awaitForModal('addCard');
		}
	};

	const updatePaymentOption = ({ paymentMethod, cardId }: PaymentOption) => {
		selectPaymentMethod(paymentMethod);
		setSelectedCardId(cardId ?? null);
		onPaymentMethodChange(paymentMethod);
	};

	useEffect(() => {
		if (isCardLoading || !cards) {
			return;
		}
		// Auto select last card if none is selected
		if (
			selectedPaymentMethod === 'card' &&
			!selectedCardId &&
			cards.length > 0
		) {
			setSelectedCardId(cards[cards.length - 1].Id);
		}
		// auto clear selected card if removed
		else if (
			selectedPaymentMethod !== 'card' ||
			(selectedCardId && cards.length === 0) ||
			(selectedCardId &&
				cards.length > 0 &&
				!cards.find(({ Id }) => Id === selectedCardId))
		) {
			setSelectedCardId(null);
		}
	}, [
		selectedPaymentMethod,
		cards,
		isCardLoading,
		setSelectedCardId,
		setSelectedCardId,
	]);

	return (
		<View>
			<View tw="flex-row justify-center">
				{applepayEnabled && (
					<PressableHover
						onPress={() =>
							updatePaymentOption({ paymentMethod: 'applepay' })
						}
						tw={[
							'mr-2 h-14 grow basis-0 items-center justify-center rounded-2xl border bg-gray-100 dark:bg-gray-900',
							selectedPaymentMethod === 'applepay'
								? 'border-themeNight dark:border-themeYellow'
								: 'border-white dark:border-gray-700',
						]}
					>
						<SvgApple
							width={24}
							height={24}
							color={isDark ? colors.white : colors.black}
						/>
					</PressableHover>
				)}
				<PressableHover
					onPress={() =>
						updatePaymentOption({
							paymentMethod: 'card',
							cardId: selectedCardId ?? activeCard?.Id,
						})
					}
					tw={[
						'mr-2 h-14 grow basis-0 items-center justify-center rounded-2xl border bg-gray-100 dark:bg-gray-900',
						selectedPaymentMethod === 'card'
							? 'border-themeNight dark:border-themeYellow'
							: 'border-white dark:border-gray-700',
					]}
				>
					<CreditCard
						width={24}
						height={24}
						color={isDark ? colors.white : colors.black}
					/>
				</PressableHover>
				<PressableHover
					onPress={() =>
						updatePaymentOption({ paymentMethod: 'iban' })
					}
					tw={[
						'h-14 grow basis-0 items-center justify-center rounded-2xl border bg-gray-100 dark:bg-gray-900',
						selectedPaymentMethod === 'iban'
							? 'border-themeNight dark:border-themeYellow'
							: 'border-white dark:border-gray-700',
					]}
				>
					<Bank
						width={38}
						height={38}
						color={isDark ? colors.white : colors.black}
					/>
				</PressableHover>
			</View>
			<View>
				{selectedPaymentMethod === 'card' && (
					<View tw="mt-4 w-full flex-row items-center justify-between rounded-2xl border border-gray-200 p-4">
						<View>
							<Text tw="text-gray-900 dark:text-gray-100">
								{t('Payment card')}
							</Text>
						</View>
						<PickCard
							selectedCardId={selectedCardId ?? undefined}
							onCardSelect={onCardSelect}
						/>
					</View>
				)}
				{selectedPaymentMethod === 'iban' && (
					<IBANPayment title={t('Pay via wire transfer')} />
				)}
			</View>
			<View tw="my-4">
				{selectedPaymentMethod === 'applepay' && (
					<Button
						size="regular"
						onPress={() =>
							onSelect({
								paymentMethod: selectedPaymentMethod,
							})
						}
					>
						{t('Use Apple Pay')}
					</Button>
				)}
				{selectedPaymentMethod === 'card' && (
					<Button
						size="regular"
						onPress={() => onCardSelect(selectedCardId)}
					>
						{selectedCardId ? t('Use card') : t('Add card')}
					</Button>
				)}
			</View>
		</View>
	);
}
