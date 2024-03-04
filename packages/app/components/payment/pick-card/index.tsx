import {
	Button,
	ModalSheet,
	PressableScale,
	Spinner,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import { useCards } from '@diversifiedfinance/app/hooks/api-hooks';
import React, { Fragment, ReactNode, useCallback, useState } from 'react';
import { cardToString } from '@diversifiedfinance/app/lib/mangopay';
import Edit from '@diversifiedfinance/design-system/icon/Edit';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import PlusSquare from '@diversifiedfinance/design-system/icon/PlusSquare';
import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import { useTranslation } from 'react-i18next';
import { CardRow } from '@diversifiedfinance/app/components/payment/pick-card/card-row';
import { Separator } from '@diversifiedfinance/app/components/payment/iban-information/separator';
import { AddCard } from '@diversifiedfinance/app/components/payment/add-card';

export interface PickCardProps {
	selectedCardId: string | undefined;
	onCardSelect: (cardId: string) => void;
	cta?: ReactNode;
}

export function PickCard({ selectedCardId, onCardSelect, cta }: PickCardProps) {
	const { t } = useTranslation();
	const { data: cards, isLoading, deleteCard } = useCards();
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [addCardModalVisible, setAddCardModalVisible] =
		useState<boolean>(false);
	const isDark = useIsDarkMode();

	const addPaymentMethod = useCallback(() => {
		setAddCardModalVisible(true);
	}, []);

	if (isLoading) {
		return (
			<View tw="w-full items-center">
				<Spinner />
			</View>
		);
	}

	if (!cards || cards.length === 0) {
		return (
			<View tw="items-center">
				<Text tw="text-gray-900 dark:text-white">
					{t('No card registered.')}
				</Text>
			</View>
		);
	}

	const selectedCard = cards.find(({ Id }) => Id === selectedCardId);

	return (
		<>
			<ModalSheet
				bodyStyle={{ height: '100%' }}
				snapPoints={['100%']}
				title={t('List of saved cards')}
				visible={modalVisible}
				close={() => setModalVisible(false)}
				onClose={() => setModalVisible(false)}
			>
				<BottomSheetScrollView>
					<View tw="flex-col mx-2 mb-4">
						{cards.map((cardData) => (
							<View key={cardData.Id}>
								<CardRow
									cardData={cardData}
									selected={cardData.Id === selectedCardId}
									onSelect={(cardId) => {
										onCardSelect(cardId);
										setTimeout(
											() => setModalVisible(false),
											200
										);
									}}
									onDelete={deleteCard}
								/>
								<Separator />
							</View>
						))}
					</View>
					<ModalSheet
						bodyStyle={{ height: '100%' }}
						snapPoints={['100%']}
						title={t('Add new card')}
						visible={addCardModalVisible}
						close={() => setAddCardModalVisible(false)}
						onClose={() => setAddCardModalVisible(false)}
					>
						<BottomSheetScrollView>
							<AddCard
								onNewCardAdded={() =>
									setAddCardModalVisible(false)
								}
							/>
						</BottomSheetScrollView>
					</ModalSheet>
					<View tw="mx-2">
						<PressableScale onPress={addPaymentMethod}>
							<View tw="my-4 flex-row">
								<PlusSquare
									color={isDark ? 'white' : 'black'}
									width={18}
									height={18}
								/>
								<Text tw="ml-2 font-bold text-gray-900 dark:text-white">
									{t('Add payment card')}
								</Text>
							</View>
						</PressableScale>
					</View>
				</BottomSheetScrollView>
			</ModalSheet>
			<PressableScale onPress={() => setModalVisible(true)}>
				{cta ?? (
					<View tw="flex-row items-center">
						<Text tw="font-bold text-black dark:text-white">
							{selectedCard ? cardToString(selectedCard) : ''}{' '}
						</Text>
						<Edit
							width={16}
							height={16}
							color={isDark ? colors.white : colors.gray[900]}
						/>
					</View>
				)}
			</PressableScale>
		</>
	);
}
