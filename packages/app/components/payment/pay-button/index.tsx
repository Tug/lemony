import { ApplePayment } from '@diversifiedfinance/app/components/payment/select-payment-method/apple-payment';
import PayWithCard from '@diversifiedfinance/app/components/payment/pay-with-card';
import { printMoney } from '@diversifiedfinance/app/lib/money';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentOption } from '../select-payment-option/types';
import { Button, Spinner, Text } from '@diversifiedfinance/design-system';

export function PayButton({
	disabled,
	isPaying,
	paymentOption,
	amountEur,
	ctaText,
	onComplete,
}: {
	disabled: boolean;
	isPaying: boolean;
	amountEur: number;
	ctaText: string;
	paymentOption: PaymentOption;
	onComplete?: () => void;
}) {
	const { t } = useTranslation();

	if (amountEur === 0) {
		return (
			<Button
				variant="primary"
				size="regular"
				tw={['my-2', disabled ? 'opacity-50' : '']}
				disabled={disabled}
				onPress={onComplete}
			>
				<>
					{isPaying && (
						<Spinner
							size="small"
							color="white"
							secondaryColor="black"
						/>
					)}
					<Text tw="mx-2 text-base font-semibold text-white dark:text-black">
						{ctaText ??
							t('Invest {{amount}}', {
								amount: printMoney(amountEur),
							})}
					</Text>
				</>
			</Button>
		);
	}

	return (
		<>
			{paymentOption?.paymentMethod === 'applepay' && (
				<ApplePayment
					disabled={disabled}
					amountEur={amountEur}
					onComplete={onComplete}
				/>
			)}
			{paymentOption?.paymentMethod === 'card' &&
				paymentOption?.cardId && (
					<PayWithCard
						disabled={disabled}
						initialCardId={paymentOption.cardId}
						showForm={false}
						amountEur={amountEur}
						ctaText={
							ctaText ??
							t('Pay {{amount}}', {
								amount: printMoney(amountEur),
							})
						}
						onComplete={onComplete}
					/>
				)}
			{/*{paymentOption?.paymentMethod === 'iban' && <IBANPayment />}*/}
		</>
	);
}
