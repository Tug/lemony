// Web only component. This component never gets rendered on native. It handles the redirect from a 3DS payment
import { View, Text } from '@diversifiedfinance/design-system';
import { useEffect } from 'react';
import { getTransactionForCard } from '../lib/payment';
import Mangopay from 'mangopay2-nodejs-sdk';

type Query = {
	error?: string;
	hello?: string;
};

// seems required for query params to be set
export async function getServerSideProps(context) {
	const { transactionId, cardId, sandbox } = context.query ?? {};
	let transaction;
	if (transactionId && cardId) {
		transaction = await getTransactionForCard(
			cardId,
			transactionId,
			Boolean(sandbox)
		);
	}

	return { props: { transactionStatus: transaction?.Status ?? 'FAILED' } };
}

// TODO NEXT: fetch transaction status from the client to avoid showing a blank page
const SecurePaymentRedirect = ({
	transactionStatus,
}: {
	transactionStatus: Mangopay.transaction.TransactionStatus | null;
}) => {
	useEffect(() => {
		const parentWindow = window.ReactNativeWebView || window.parent;
		if (parentWindow) {
			parentWindow.postMessage(
				JSON.stringify({
					type: '3ds-completed',
					status: transactionStatus,
				})
			);
		}
	}, []);

	return (
		<View tw="flex h-screen w-screen items-center justify-center">
			<Text tw="text-lg text-black">
				{transactionStatus === 'FAILED'
					? 'Payment failed. Please try again.'
					: ''}
			</Text>
		</View>
	);
};

SecurePaymentRedirect.getLayout = (page) => page;

export default SecurePaymentRedirect;
