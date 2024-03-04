import { Button, Text, View, Image } from '@diversifiedfinance/design-system';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { Trans, useTranslation } from 'react-i18next';
import { useTrackScreenViewed } from '@diversifiedfinance/app/lib/analytics';
import { AddCardBottomSheet } from '@diversifiedfinance/app/components/payment/add-card';
import React from 'react';
import { getStaticImage } from '@diversifiedfinance/app/utilities';
import { useVIPUserLevel } from '@diversifiedfinance/app/hooks/use-vip-user-level';
import { Basket } from '@diversifiedfinance/app/hooks/use-checkout';

export interface CheckoutSuccess {
	onAction: () => void;
	basket: Basket;
}
export const AddCardPage = () => {
	return <AddCardBottomSheet />;
};

export function CheckoutSuccess({ onAction, basket }: CheckoutSuccess) {
	useTrackScreenViewed({ name: 'checkoutSuccess' });
	const {
		benefits: { xpPerDified },
	} = useVIPUserLevel();
	const difiedAmount = basket?.products?.[0].amountToken ?? 0;
	const xpWon = Math.ceil(difiedAmount * xpPerDified);
	const { t } = useTranslation();
	const navigateTo = useNavigateToScreen();
	return (
		<View tw="mx-4">
			<View tw="my-8">
				<Image
					resizeMode="contain"
					source={{ uri: getStaticImage('party.png') }}
					style={{
						width: '100%',
						height: 172,
					}}
					alt="DIFIED"
				/>
			</View>
			<View tw="my-2 items-center">
				<View tw="my-1">
					<Text tw="text-xl font-inter font-bold text-black dark:text-white">
						{t('Thank you for your investment.')}
					</Text>
				</View>
				<View tw="my-2">
					<Text tw="text-sm text-gray-700 dark:text-gray-300">
						{t('You will receive a confirmation email shortly.')}
					</Text>
				</View>
			</View>
			<View tw="mt-8 mb-4 items-center">
				<Text tw="text-sm text-diversifiedBlue text-black dark:text-white">
					<Trans
						t={t}
						// this is required so the value is the translation key
						values={{
							xpWon: t('{{ points }} XP', {
								points: xpWon.toString(),
							}),
						}}
					>
						You earned <Text tw="font-bold">{{ xpWon }}</Text> for
						this investment! Gain more points by referring your
						friends.
					</Trans>
				</Text>
			</View>
			<View tw="my-4">
				<Button
					tw="my-2"
					variant="outlined"
					size="regular"
					onPress={() => {
						navigateTo('referAFriend');
						onAction?.();
					}}
				>
					{t('Refer a friend')}
				</Button>
				<Button
					variant="primary"
					size="regular"
					onPress={() => {
						navigateTo('portfolioTab');
						onAction?.();
					}}
				>
					{t('Go to my Portfolio')}
				</Button>
			</View>
		</View>
	);
}
