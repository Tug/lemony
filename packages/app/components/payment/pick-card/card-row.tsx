import {
	Button,
	Pressable,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { cardToString } from '@diversifiedfinance/app/lib/mangopay';
import React from 'react';
import type { card } from 'mangopay2-nodejs-sdk';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import CheckFilled from '@diversifiedfinance/design-system/icon/CheckFilled';
import Trash from '@diversifiedfinance/design-system/icon/Trash';
import CreditCard from '@diversifiedfinance/design-system/icon/CreditCard';
import { useTranslation } from 'react-i18next';

interface CardRowProps {
	cardData: card.CardData;
	selected?: boolean;
	onSelect: (cardId: string) => void;
}
export function CardRow({
	cardData,
	selected = false,
	onSelect,
	onDelete,
}: CardRowProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const expMonthStr = cardData.ExpirationDate.substring(0, 2);
	const expYearStr = cardData.ExpirationDate.substring(2, 5);
	const expiryDate = new Date();
	// last month should be valid, let's compare it to the next one
	// it's ok to overflow months:
	//  setFullYear(2025, 12, 1) == setFullYear(2026, 0, 1)
	expiryDate.setFullYear(
		2000 + Number(expYearStr),
		Number(expMonthStr) - 1 + 1,
		1
	);
	const expired = expiryDate < new Date();
	return (
		<View tw="w-full flex-row justify-between items-center my-4">
			<Pressable
				tw="flex-row items-center"
				onPress={() => onSelect(cardData.Id)}
			>
				{selected ? (
					<CheckFilled
						height={20}
						width={20}
						color={isDark ? colors.white : colors.black}
					/>
				) : (
					<View tw="h-5 w-5 rounded-full border-[1px] border-gray-800 dark:border-gray-100" />
				)}
				<View tw="ml-5">
					<View tw="my-1 flex-row items-center">
						<CreditCard
							color={isDark ? colors.white : colors.black}
						/>
						<View tw="ml-2">
							<Text tw="font-bold text-base text-black dark:text-white">
								{cardToString(cardData)}
							</Text>
						</View>
						<View tw="ml-4">
							<Text tw="text-base text-black dark:text-white">
								{`${cardData.ExpirationDate.substring(
									0,
									2
								)}/${cardData.ExpirationDate.substring(2, 5)}`}
							</Text>
						</View>
					</View>
					{expired && (
						<View>
							<Text tw="text-sm font-bold text-red-500">
								{t('Expired')}
							</Text>
						</View>
					)}
				</View>
			</Pressable>
			<View>
				<Button
					variant="text"
					tw="px-0 font-thin"
					onPress={() => onDelete(cardData.Id)}
					style={{ padding: 0 }}
					iconOnly
				>
					<Trash width={20} height={20} />
				</Button>
			</View>
		</View>
	);
}
