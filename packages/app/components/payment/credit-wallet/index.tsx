import React from 'react';
import { SelectPaymentMethod } from '../select-payment-method';
import { BottomSheetModalProvider } from '@diversifiedfinance/design-system/bottom-sheet';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';

export interface CreditWalletProps {}

type Query = {
	amount?: string;
};
const { useParam } = createParam<Query>();

export function CreditWallet({}: CreditWalletProps) {
	const [amount] = useParam('amount');
	return (
		<BottomSheetModalProvider>
			<SelectPaymentMethod
				amountEur={!isNaN(Number(amount)) ? Number(amount) : undefined}
			/>
		</BottomSheetModalProvider>
	);
}
