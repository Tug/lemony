import { Button, Spinner, Text } from '@diversifiedfinance/design-system';
import { useCallback, useEffect, useState } from 'react';
import {
	BrowserInfoData,
	creditEurWalletWithCard,
	registerCard,
} from '@diversifiedfinance/app/lib/mangopay';
import { toast } from '@diversifiedfinance/design-system/toast';
import { CardRegistrationData } from 'mangopay-cardregistration-js-kit';
import type { payIn } from 'mangopay2-nodejs-sdk';
import { WebView3DS2 } from './webview-3ds2';
import { useRouter } from '@diversifiedfinance/design-system/router';
import {
	MAX_AMOUNT_EUR_CREDIT_CARD,
	MIN_AMOUNT_EUR_CREDIT_CARD,
} from '@diversifiedfinance/app/lib/constants';
import CreditCardInput, {
	CardDetails,
} from '@diversifiedfinance/components/credit-card-input';
import { useCards, useWallets } from '@diversifiedfinance/app/hooks/api-hooks';
import { useTranslation } from 'react-i18next';

export interface PayWithCardProps {
	disabled?: boolean;
	amountEur: number;
	registerCardOnly?: boolean;
	initialCardId?: string;
	showForm?: boolean;
	ctaText?: string;
	onNewCardAdded?: (cardId: string) => void;
	onComplete?: () => void;
}

class PayinError extends Error {
	constructor(payinData: payIn.CardDirectPayInData) {
		super(payinData.ResultMessage);
		this.ResultMessage = payinData.ResultMessage;
		this.ResultCode = payinData.ResultCode;
	}
}

// require a BottomSheetModalProvider mounted
export default function PayWithCard({
	disabled,
	amountEur,
	registerCardOnly,
	initialCardId,
	showForm = true,
	onNewCardAdded,
	ctaText = 'Pay',
	onComplete,
}: PayWithCardProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const { mutate: refreshCards } = useCards();
	const { mutate: refreshWallets } = useWallets();
	const [cardDetails, updateCardDetails] = useState<CardDetails>();
	const [isSubmitting, setSubmitting] = useState<boolean>(false);
	const [cardId, setCardId] = useState(initialCardId);
	const isValidAmount =
		amountEur >= MIN_AMOUNT_EUR_CREDIT_CARD &&
		amountEur <= MAX_AMOUNT_EUR_CREDIT_CARD;
	const canSubmit =
		!disabled &&
		!isSubmitting &&
		isValidAmount &&
		(cardId || (cardDetails ? cardDetails.complete : false));
	const [browserData, setBrowserData] = useState<BrowserInfoData>();
	const [destinationUrl3DS2, setDestinationUrl3DS2] = useState<string>();

	useEffect(() => {
		if (initialCardId) {
			setCardId(initialCardId);
		}
	}, [initialCardId]);

	const onPaymentCompleted = useCallback(async () => {
		toast.success(t('Payment Success!'));
		await refreshWallets();
		if (onComplete) {
			onComplete();
		} else {
			router.pop();
		}
	}, [router, t, onComplete, refreshWallets]);

	const handleError = useCallback(
		(error: Error) => {
			toast.error(
				error.response?.data?.error ??
					error.message ??
					error.ResultMessage ??
					error.toString()
			);
			refreshCards();
		},
		[t, refreshCards]
	);

	const creditWallet = useCallback(async () => {
		if (registerCardOnly) {
			return;
		}
		if (!browserData) {
			throw new Error(t('Browser data missing for 3DS'));
		}
		if (!cardId) {
			throw new Error(t('No card selected'));
		}
		const cardDirectPayInData = await creditEurWalletWithCard({
			cardId,
			amountEur,
			browserInfo: browserData,
		});
		if (cardDirectPayInData.Status === 'FAILED') {
			if (__DEV__) {
				console.log('cardDirectPayInData', cardDirectPayInData);
			}
			throw new PayinError(cardDirectPayInData);
		}
		if (cardDirectPayInData.SecureModeNeeded) {
			setDestinationUrl3DS2(cardDirectPayInData.SecureModeRedirectURL);
		} else {
			await onPaymentCompleted();
		}
	}, [cardId, amountEur, browserData, registerCardOnly, onPaymentCompleted]);

	const submitCardRegistration = useCallback(() => {
		setSubmitting(true);

		if (cardId && !cardDetails?.complete) {
			creditWallet()
				.catch(handleError)
				.finally(() => {
					setSubmitting(false);
				});
			return;
		}

		registerCard(cardDetails)
			.then((cardRegistrationData: CardRegistrationData) => {
				if (!cardRegistrationData.CardId) {
					throw new Error(
						t('CardId missing from CardRegistrationData')
					);
				}
				toast.success(t('Credit card added!'));
				onNewCardAdded?.(cardRegistrationData.CardId);
				return creditWallet();
			})
			.catch(handleError)
			.finally(() => {
				setSubmitting(false);
			});
	}, [
		creditWallet,
		cardDetails,
		cardId,
		browserData,
		registerCardOnly,
		handleError,
	]);

	return (
		<>
			<WebView3DS2
				destinationUrl={destinationUrl3DS2}
				onBrowserData={setBrowserData}
				on3DS2Completed={onPaymentCompleted}
			/>
			{!initialCardId && showForm && (
				<CreditCardInput
					onUpdate={(details: CardDetails) => {
						updateCardDetails(details);
					}}
				/>
			)}
			<Button
				variant="primary"
				size="regular"
				onPress={submitCardRegistration}
				tw={['mt-4', !canSubmit ? 'opacity-50' : '']}
				disabled={!canSubmit || isSubmitting}
			>
				<>
					{isSubmitting && (
						<Spinner
							size="small"
							color="white"
							secondaryColor="black"
						/>
					)}
					<Text tw="mx-4 text-base font-bold text-white dark:text-black">
						{ctaText}
					</Text>
				</>
			</Button>
		</>
	);
}
