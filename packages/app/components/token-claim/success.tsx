import { Button, Text, View, Image } from '@diversifiedfinance/design-system';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useTranslation } from 'react-i18next';
import { useTrackScreenViewed } from '@diversifiedfinance/app/lib/analytics';
import React from 'react';
import { getStaticImage } from '@diversifiedfinance/app/utilities';

export interface CheckoutSuccess {
	onAction: () => void;
}

export function TokenClaimCheckoutSuccess({ onAction }: CheckoutSuccess) {
	useTrackScreenViewed({ name: 'claimSuccess' });
	const { t } = useTranslation();
	const redirectTo = useNavigateToScreen();
	return (
		<View tw="mx-4 mt-4">
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
						{t('Thank you for using Diversified.')}
					</Text>
				</View>
				<View tw="my-2">
					<Text tw="text-sm text-gray-700 dark:text-gray-300">
						{t('You will receive a confirmation email shortly.')}
					</Text>
				</View>
			</View>
			<View tw="my-4">
				<Button
					tw="my-2"
					variant="outlined"
					size="regular"
					onPress={() => {
						redirectTo('referAFriend');
						onAction?.();
					}}
				>
					{t('Refer a friend')}
				</Button>
				<Button
					variant="primary"
					size="regular"
					onPress={() => {
						redirectTo('portfolioTab');
						onAction?.();
					}}
				>
					{t('Go to my Portfolio')}
				</Button>
			</View>
		</View>
	);
}
