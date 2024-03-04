import React, { useState } from 'react';
import { View } from '@diversifiedfinance/design-system';
import { PressableHover } from '@diversifiedfinance/design-system/pressable-hover';
import Bank from '@diversifiedfinance/design-system/icon/Bank';
import CreditCard from '@diversifiedfinance/design-system/icon/CreditCard';
import { CardPayment } from './card-payment';
import { IBANPayment } from './iban-payment';
import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import PoweredByMangopay from '@diversifiedfinance/app/components/payment/select-payment-method/powered-by-mangopay';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import SvgApple from '@diversifiedfinance/design-system/icon/Apple';
import { ApplePayment } from './apple-payment';
import { Platform } from 'react-native';

export interface SelectPaymentMethodProps {
	amountEur?: number;
}

export function SelectPaymentMethod({ amountEur }: SelectPaymentMethodProps) {
	const applepayEnabled =
		Platform.OS === 'ios' ||
		(Platform.OS === 'web' &&
			window.ApplePaySession &&
			window.ApplePaySession.canMakePayments()); // Apple Pay only works on Safari on the web
	const isDark = useIsDarkMode();
	const [selectedPaymentOption, setSelectedPaymentOption] = useState<
		'applepay' | 'card' | 'iban'
	>(applepayEnabled ? 'applepay' : 'card');

	return (
		<BottomSheetScrollView>
			<View tw="mx-4 flex-row justify-center">
				{applepayEnabled && (
					<PressableHover
						onPress={() => setSelectedPaymentOption('applepay')}
						tw={[
							'mr-2 h-14 grow basis-0 items-center justify-center rounded-2xl border bg-gray-100 dark:bg-gray-900',
							selectedPaymentOption === 'applepay'
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
					onPress={() => setSelectedPaymentOption('card')}
					tw={[
						'mr-2 h-14 grow basis-0 items-center justify-center rounded-2xl border bg-gray-100 dark:bg-gray-900',
						selectedPaymentOption === 'card'
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
					onPress={() => setSelectedPaymentOption('iban')}
					tw={[
						'h-14 grow basis-0 items-center justify-center rounded-2xl border bg-gray-100 dark:bg-gray-900',
						selectedPaymentOption === 'iban'
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
			<View tw="m-4">
				{applepayEnabled && selectedPaymentOption === 'applepay' && (
					<ApplePayment amountEur={amountEur} />
				)}
				{selectedPaymentOption === 'card' && (
					<CardPayment amountEur={amountEur} />
				)}
				{selectedPaymentOption === 'iban' && <IBANPayment />}
			</View>
			<View tw="mx-[35%] h-24">
				<PoweredByMangopay style={{ width: '100%', height: '100%' }} />
			</View>
		</BottomSheetScrollView>
	);
}
