import { TokenRow } from './token-row';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { Text } from '@diversifiedfinance/design-system';
import { Project } from '@diversifiedfinance/types';
import { Trans, useTranslation } from 'react-i18next';

export interface TokenResponseItem {
	amount: number;
	initialEurValue: number;
	totalPaid: number;
	project: Project;
	orderStatus: 'paid' | 'prepaid' | 'processed' | 'preprocessed';
}

export interface UserTokensCardProps {
	data: TokenResponseItem[];
	rowCount?: number;
	tw?: string;
}

export default function UserTokensCard({
	data,
	rowCount = 3,
	tw,
}: UserTokensCardProps) {
	const { t } = useTranslation();
	const paidTokens = data.filter(
		(token) =>
			token.orderStatus === 'paid' || token.orderStatus === 'processed'
	);
	const prepaidTokens = data.filter(
		(token) =>
			token.orderStatus === 'prepaid' ||
			token.orderStatus === 'preprocessed'
	);
	return (
		<View tw={tw ?? ''}>
			{prepaidTokens.length > 0 && (
				<>
					<View tw="my-8 items-start">
						<Text tw="text-2xl text-center text-black dark:text-white">
							{t('My presales')}
						</Text>
					</View>
					<View tw="flex-col">
						{prepaidTokens.map((token, index) => (
							<TokenRow key={token.project.id} {...token} />
						))}
					</View>
				</>
			)}
			{(paidTokens.length > 0 || data.length === 0) && (
				<>
					<View tw="my-8 items-start">
						<Text tw="text-2xl text-center text-black dark:text-white">
							{t('My Assets')}
						</Text>
					</View>
					<View tw="flex-col">
						{data.length === 0 && (
							<Text tw="text-black dark:text-white">
								<Trans t={t}>
									You will be able to find the projects you
									participated in here.
								</Trans>
							</Text>
						)}
						{paidTokens.map((token, index) => (
							<TokenRow key={token.project.id} {...token} />
						))}
						{/*<View>*/}
						{/*	{data.length > rowCount && (*/}
						{/*		<Button*/}
						{/*			variant="primary"*/}
						{/*			size="regular"*/}
						{/*			onPress={() => navigateTo('userTokens')}*/}
						{/*		>*/}
						{/*			See All*/}
						{/*		</Button>*/}
						{/*	)}*/}
						{/*</View>*/}
					</View>
				</>
			)}
		</View>
	);
}
