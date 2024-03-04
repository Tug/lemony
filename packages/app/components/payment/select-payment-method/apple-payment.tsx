import React, { useContext, useEffect, useState } from 'react';
import { Button, Text, View } from '@diversifiedfinance/design-system';
import { useTranslation } from 'react-i18next';
import {
	creditEurWalletWithPaymentRequest,
	printMoney,
} from '@diversifiedfinance/app/lib/mangopay';
import { toast } from '@diversifiedfinance/design-system/toast';
import { SettingsContext } from '@diversifiedfinance/app/context/settings-context';
import { ApplePayButton } from '@diversifiedfinance/app/lib/payment-request';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { getAxiosErrorMessage } from '@diversifiedfinance/app/utilities';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useWallets } from '@diversifiedfinance/app/hooks/api-hooks';
import { SimpleAmountInput } from '@diversifiedfinance/app/components/amount-input';
import {
	MAX_AMOUNT_EUR_CREDIT_CARD,
	MIN_AMOUNT_EUR_CREDIT_CARD_RECOMMENDED,
} from '@diversifiedfinance/app/lib/constants';

export function ApplePayment({
	disabled,
	amountEur,
	onComplete,
}: {
	disabled: boolean;
	amountEur?: number;
	onComplete?: () => void;
}) {
	const isDark = useIsDarkMode();
	const router = useRouter();
	const { mutate: refreshWallets } = useWallets();
	const { paymentSandbox: useSandbox } = useContext(SettingsContext);
	const { t } = useTranslation();
	const defaultAmount = MIN_AMOUNT_EUR_CREDIT_CARD_RECOMMENDED;
	const isAmountEditable = !amountEur;
	const [amount, setAmount] = useState<number>(amountEur ?? defaultAmount);

	const pay = async () => {
		try {
			await creditEurWalletWithPaymentRequest({
				amountEur: isAmountEditable ? amount : amountEur,
				useSandbox,
			});
			await refreshWallets();
			if (onComplete) {
				onComplete();
			} else {
				router.pop();
			}
		} catch (err) {
			if (err.message === 'AbortError') {
				return;
			}
			toast.error(t(getAxiosErrorMessage(err)));
		}
	};

	return (
		<View tw="my-4">
			{/*
				SNCF Connect use custom Apple Pay button with rounded
			    corners even though Apple requires using their design.
			    For now let's stick to Apple's version so we don't get
			    blocked on review
			*/}
			{isAmountEditable && (
				<View tw="mb-4">
					<View tw="mb-6">
						<Text tw="text-base text-black dark:text-white">
							{t('Credit your account via Apple Pay.')}
						</Text>
					</View>
					<SimpleAmountInput
						tw="border-gray-200"
						currency="EUR"
						step={1}
						value={amount}
						onChange={setAmount}
						withSlider
						minValueSlider={MIN_AMOUNT_EUR_CREDIT_CARD_RECOMMENDED}
						maxValueSlider={MAX_AMOUNT_EUR_CREDIT_CARD}
					/>
					<View tw="mt-6 mb-2 w-full flex-row items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
						<Button
							variant="secondary"
							onPress={() => setAmount(0)}
						>
							{t('Reset')}
						</Button>
						<Button
							variant="tertiary"
							onPress={() => setAmount(100)}
						>
							{printMoney(100)}
						</Button>
						<Button
							variant="tertiary"
							onPress={() => setAmount(200)}
						>
							{printMoney(200)}
						</Button>
						<Button
							variant="tertiary"
							onPress={() => setAmount(1000)}
						>
							{printMoney(1000)}
						</Button>
					</View>
				</View>
			)}
			<ApplePayButton
				type="inStore"
				style={isDark ? 'white' : 'black'}
				onPress={() => !disabled && pay()}
			/>
		</View>
	);
}
