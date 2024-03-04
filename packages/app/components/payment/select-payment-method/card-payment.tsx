import { useCards } from '@diversifiedfinance/app/hooks/api-hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Spinner, Text, View } from '@diversifiedfinance/design-system';
import PayWithCard from '../pay-with-card';
import {
	MIN_AMOUNT_EUR_CREDIT_CARD,
	MAX_AMOUNT_EUR_CREDIT_CARD,
	MIN_AMOUNT_EUR,
	MIN_AMOUNT_EUR_CREDIT_CARD_RECOMMENDED,
} from '@diversifiedfinance/app/lib/constants';
import { PickCard } from '@diversifiedfinance/app/components/payment/pick-card';
import { AddCard } from '@diversifiedfinance/app/components/payment/add-card';
import { useTranslation } from 'react-i18next';
import { printMoney } from '@diversifiedfinance/app/lib/mangopay';
import { SimpleAmountInput } from '@diversifiedfinance/app/components/amount-input';

export function CardPayment({ amountEur }: { amountEur?: number }) {
	const { t } = useTranslation();
	const { data: cards, isLoading } = useCards();
	const [currentCardId, setCurrentCardId] = useState<string>();
	const defaultAmount = MIN_AMOUNT_EUR_CREDIT_CARD_RECOMMENDED;
	const isAmountEditable = !amountEur;
	const [amount, setAmount] = useState<number>(amountEur ?? defaultAmount);
	const currentCard = cards?.find((card) => card.Id === currentCardId);

	useEffect(() => {
		if (!currentCardId && cards && cards.length > 0) {
			let activeCardId = cards.find((card) => card.isLastUsed)?.Id;
			if (!activeCardId) {
				activeCardId = cards[cards.length - 1].Id;
			}
			setCurrentCardId(activeCardId);
		}
	}, [currentCardId, cards]);

	if (isLoading) {
		return (
			<View tw="my-8 items-center">
				<Spinner />
			</View>
		);
	}

	return (
		<>
			<View tw="mt-4 mb-6">
				<Text tw="text-base text-black dark:text-white">
					{t('Credit your account via card.')}
				</Text>
			</View>

			{currentCard ? (
				<View>
					<View tw="flex-row items-center">
						<SimpleAmountInput
							tw="border-gray-200"
							currency="EUR"
							step={1}
							value={amount}
							onChange={setAmount}
							withSlider={isAmountEditable}
							disabled={!isAmountEditable}
							minValueSlider={
								MIN_AMOUNT_EUR_CREDIT_CARD_RECOMMENDED
							}
							maxValueSlider={MAX_AMOUNT_EUR_CREDIT_CARD}
						/>
					</View>
					{isAmountEditable && (
						<View tw="mt-6 w-full flex-row items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
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
					)}
					<View tw="mt-6 w-full flex-row items-center justify-between rounded-2xl border border-gray-200 p-4">
						<View>
							<Text tw="text-gray-900 dark:text-gray-100">
								{t('Payment card')}
							</Text>
						</View>
						<PickCard
							selectedCardId={currentCardId}
							onCardSelect={setCurrentCardId}
						/>
					</View>
					<PayWithCard
						initialCardId={currentCard?.Id}
						onNewCardAdded={setCurrentCardId}
						amountEur={amount}
						ctaText={t('Credit {{amount}}', {
							amount: printMoney(amount),
						})}
					/>
				</View>
			) : (
				<AddCard onNewCardAdded={setCurrentCardId} />
			)}
		</>
	);
}
