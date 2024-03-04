import { SimpleAmountInput } from '@diversifiedfinance/app/components/amount-input';
import React, { useState } from 'react';
import {
	useBankAccounts,
	useEurWallet,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { View, Text, Button } from '@diversifiedfinance/design-system';
import { printMoney } from '@diversifiedfinance/app/lib/money';
import { useTranslation } from 'react-i18next';
import { fromMangopayMoney } from '@diversifiedfinance/app/lib/mangopay';
import { Input } from '@diversifiedfinance/design-system/input';

export const Payout = ({
	bankAccountId,
	onComplete,
}: {
	bankAccountId: string;
	onComplete?: () => void;
}) => {
	const { t } = useTranslation();
	const { data: eurWallet } = useEurWallet();
	const { payout } = useBankAccounts();
	const walletBalance = fromMangopayMoney(eurWallet?.balance ?? 0);
	const minAmount = 0;
	const maxAmount = walletBalance;
	const [amount, setAmount] = useState<number>(minAmount);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [transferReference, setTransferReference] = useState<string>('');
	const canSubmit = amount > 0 && !submitting;
	const sendMoney = async () => {
		setSubmitting(true);
		try {
			await payout(bankAccountId, {
				amountCent: amount * 100,
				currency: 'EUR',
				instant: false,
				label: transferReference,
			});
			onComplete?.();
		} finally {
			setSubmitting(false);
		}
	};
	const onMaxPressed = () => {
		setAmount(walletBalance);
	};

	return (
		<View tw="mx-4">
			<View tw="my-2">
				<Text tw="text-base text-black dark:text-white">
					{t(
						'Send Euros from your Diversified wallet to your Bank Account.'
					)}
				</Text>
			</View>
			<View tw="mt-2">
				<SimpleAmountInput
					currency="EUR"
					value={amount}
					onChange={setAmount}
					withSlider
					minValueSlider={minAmount}
					maxValueSlider={maxAmount}
				/>
			</View>
			<View tw="mt-5 w-full flex-row items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
				<Button
					variant="tertiary"
					tw={walletBalance <= amount ? 'opacity-50' : ''}
					onPress={onMaxPressed}
				>
					{t('Max')}
				</Button>
				<View tw="flex-row">
					<Text tw="text-sm text-black dark:text-white">
						{t('Euro Wallet balance:')}{' '}
					</Text>
					<Text tw="text-base font-bold text-black dark:text-white">
						{printMoney(walletBalance)}
					</Text>
				</View>
			</View>
			<View tw="mt-4">
				<Input
					value={transferReference}
					placeholder={t('Bank transfer reference (Optional)')}
					onChangeText={setTransferReference}
				/>
			</View>
			<View tw="mt-5">
				<Button
					tw={[!canSubmit ? 'opacity-50' : '']}
					disabled={!canSubmit}
					size="regular"
					variant="primary"
					onPress={sendMoney}
				>
					{t('Send')}
				</Button>
			</View>
		</View>
	);
};
