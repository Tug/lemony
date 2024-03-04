import { Button, Spinner, Text, View } from '@diversifiedfinance/design-system';
import { useCards } from '@diversifiedfinance/app/hooks/api-hooks';
import Plus from '@diversifiedfinance/design-system/icon/Plus';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export interface CardsProps {
	selectedCardId: string | undefined;
	onCardSelect: (cardId: string) => void;
}

export function Cards({ selectedCardId, onCardSelect }: CardsProps) {
	const { t } = useTranslation();
	const { data: cards, isLoading } = useCards();
	const isDark = useIsDarkMode();

	if (isLoading) {
		return (
			<View tw="w-full items-center">
				<Spinner />
			</View>
		);
	}

	if (!cards || cards.length === 0) {
		return (
			<View tw="w-full items-center">
				<Text tw="text-gray-900 dark:text-white">
					{t('No card registered at the moment.')}
				</Text>
			</View>
		);
	}

	return (
		<View tw="m-4 flex-col">
			{cards.map((cardData, index) => (
				<Button
					key={cardData.Id}
					variant={
						cardData.Id === selectedCardId ? 'primary' : 'tertiary'
					}
					tw="my-4 mb-2"
					onPress={() => onCardSelect(cardData.Id)}
				>
					<View
						key={index.toString()}
						tw={['w-full flex-row justify-between items-center']}
					>
						<Text
							tw={
								cardData.Id === selectedCardId
									? 'text-white dark:text-black'
									: 'text-black dark:text-white'
							}
						>
							{cardData.CardProvider}
						</Text>
						<Text
							tw={
								cardData.Id === selectedCardId
									? 'text-white dark:text-black'
									: 'text-black dark:text-white'
							}
						>
							{cardData.Alias}
						</Text>
						<Text
							tw={
								cardData.Id === selectedCardId
									? 'text-white dark:text-black'
									: 'text-black dark:text-white'
							}
						>
							{cardData.Validity}
						</Text>
						<Text
							tw={
								cardData.Id === selectedCardId
									? 'text-white dark:text-black'
									: 'text-black dark:text-white'
							}
						>
							{cardData.ExpirationDate}
						</Text>
					</View>
				</Button>
			))}
			<View tw="">
				<Button variant="primary">
					<Plus color={isDark ? 'white' : 'black'} />
					<Text tw="text-gray-900 dark:text-white">
						{t('Add payment method')}
					</Text>
				</Button>
			</View>
		</View>
	);
}
