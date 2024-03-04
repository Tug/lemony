import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { Skeleton } from '@diversifiedfinance/design-system';
import { PortfolioCard } from '../card';
import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';
import { IbanInformationSkeleton } from '@diversifiedfinance/app/components/payment/iban-information/skeleton';

export interface UserWalletCardSkeletonProps {
	tw?: string;
}

export function UserWalletCardSkeleton({ tw }: UserWalletCardSkeletonProps) {
	return (
		<View tw={['flex-row', tw ?? '']}>
			<PortfolioCard tw="px-0 py-0">
				<View tw="bg-themeNight flex-row items-center rounded-t-2xl">
					<View tw="p-5">
						<Skeleton height={30} width={120} show />
					</View>
					{/*<View*/}
					{/*	style={{*/}
					{/*		position: 'absolute',*/}
					{/*		right: '5%',*/}
					{/*		top: '-55%',*/}
					{/*		width: 89,*/}
					{/*		height: 89,*/}
					{/*	}}*/}
					{/*>*/}
					{/*	<Skeleton*/}
					{/*		tw="absolute"*/}
					{/*		width="100%"*/}
					{/*		height="100%"*/}
					{/*		show*/}
					{/*	/>*/}
					{/*</View>*/}
				</View>
				<View tw="p-5">
					<IbanInformationSkeleton showName showBalance />
					<View tw="mt-3">
						<Skeleton width="100%" height={50} show />
					</View>
				</View>
			</PortfolioCard>
		</View>
	);
}
