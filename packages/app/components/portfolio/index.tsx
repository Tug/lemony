import UserTokensCard from './user-tokens-card';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import React, { useEffect, useState } from 'react';
import { Button, Spinner } from '@diversifiedfinance/design-system';
import Screen from '@diversifiedfinance/app/components/screen';
import { PortfolioSummaryCard } from './portfolio-summary-card';
import { CapitalDistributionCard } from './capital-distribution-card';
import { HistoricPerformance } from './historic-performance';
import { UserWalletCard } from './user-wallet-card';
import {
	useCreditsWallet,
	useEurWallet,
	usePortfolioPrice,
	useUserTokens,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import AlertTriangle from '@diversifiedfinance/design-system/icon/AlertTriangle';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { GetApplicantStatusResponseSDK } from '@sumsub/api-types';
import { ContactUsButton } from './contact-us-button';
import { fromMangopayMoney } from '@diversifiedfinance/app/lib/mangopay';
import { useKycSync } from '@diversifiedfinance/app/hooks/use-kyc-sync';
import { Trans, useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { PortfolioMetricsCarousel } from '@diversifiedfinance/app/components/portfolio/portfolio-metrics-carousel';
import { Platform } from 'react-native';

export interface PortfolioProps {}

export function Portfolio({}: PortfolioProps) {
	const { t } = useTranslation();
	const {
		isIncompletedProfile,
		isVerifiedProfile,
		isFailedKYC,
		mutate: refreshUser,
	} = useUser();
	const {
		data: tokens,
		isValidating: isValidatingTokens,
		isLoading: isLoadingTokens,
		mutate: refreshTokens,
	} = useUserTokens();
	const {
		isLoading: isLoadingPrices,
		isValidating: isValidatingPrices,
		data: prices,
		mutate: refreshPrices,
	} = usePortfolioPrice();
	useKycSync();
	const {
		data: eurWallet,
		isLoading: isLoadingEurWallet,
		mutate: refreshEurWallet,
	} = useEurWallet();
	const {
		data: creditsWallet,
		isLoading: isLoadingCreditsWallet,
		mutate: refreshCreditsWallet,
	} = useCreditsWallet();
	const isDark = useIsDarkMode();
	const [kycStatus, setKycStatus] = useState<GetApplicantStatusResponseSDK>();
	const isKYCInProgress =
		kycStatus &&
		['pending', 'prechecked', 'queued'].includes(kycStatus.reviewStatus);
	const router = useRouter();
	const tokensTotalEur = prices?.latest_price?.[1] ?? 0;
	const walletEurBalance =
		fromMangopayMoney(eurWallet?.balance ?? 0) +
		(creditsWallet?.balance ?? 0);
	const estimatedPortfolioValue = tokensTotalEur + walletEurBalance;
	const totalInvestedAmount =
		walletEurBalance +
		tokens?.reduce((acc, token) => {
			return acc + token.initialEurValue;
		}, 0);
	const percentChangeFromInvestedAmount =
		((estimatedPortfolioValue - totalInvestedAmount) /
			totalInvestedAmount) *
		100;

	const isLoadingTotal =
		isLoadingPrices ||
		isValidatingPrices ||
		isLoadingCreditsWallet ||
		isLoadingEurWallet;

	useEffect(() => {
		if (isFailedKYC || isKYCInProgress) {
			async function refreshKYCStatus() {
				const response = await axios({
					url: '/api/kyc/status',
					method: 'GET',
				});
				if (response) {
					setKycStatus(response as GetApplicantStatusResponseSDK);
				}
			}
			refreshKYCStatus();
		}
	}, [isFailedKYC, isKYCInProgress]);

	const verifyID = () => {
		if (isIncompletedProfile) {
			router.push('/settings/profile/edit');
		} else if (!isVerifiedProfile) {
			router.push('/settings/kyc');
		}
	};

	const refreshAll = () => {
		refreshUser();
		refreshTokens();
		refreshPrices();
		refreshEurWallet();
		refreshCreditsWallet();
	};

	return (
		<Screen
			isRefreshing={
				isLoadingTotal || isLoadingTokens || isValidatingTokens
			}
			onRefresh={refreshAll}
			withBackground
		>
			<View
				tw={Platform.select({
					web: 'mx-auto w-[400px] lg:w-[600px]',
				})}
			>
				<PortfolioSummaryCard
					isLoading={isLoadingTotal}
					estimatedPortfolioValue={estimatedPortfolioValue}
					totalInvestedAmount={totalInvestedAmount}
					percentChangeFromInvestedAmount={
						percentChangeFromInvestedAmount
					}
				/>
				<CapitalDistributionCard tw="mb-6" tokens={tokens} />
				<PortfolioMetricsCarousel tw="mb-2" tokens={tokens} />
				{isFailedKYC && (
					<View tw="mb-4 flex-col justify-start rounded-2xl bg-orange-100 p-4 dark:bg-gray-100">
						<View tw="mb-2 flex-row items-center">
							<AlertTriangle
								width={16}
								height={16}
								color={colors.red[500]}
							/>
							<Text tw="ml-3 text-sm font-bold text-red-500">
								{t('KYC Failed')}
							</Text>
						</View>
						<View tw="mb-4">
							{kycStatus?.reviewResult?.moderationComment && (
								<View tw="mb-4 mt-2">
									<Text tw="text-sm text-gray-500 dark:text-gray-800">
										{
											kycStatus.reviewResult
												.moderationComment
										}
									</Text>
								</View>
							)}
							{kycStatus?.reviewResult?.reviewRejectType ===
								'FINAL' && (
								<Text tw="text-xs text-gray-500 dark:text-gray-800">
									<Trans t={t}>
										Diversified is available in the EU for
										all residents of legal age. If you think
										this is an error, please contact us.
									</Trans>
								</Text>
							)}
						</View>
						{kycStatus?.reviewResult?.reviewRejectType ===
						'RETRY' ? (
							<Button
								tw={isKYCInProgress ? 'opacity-50' : ''}
								disabled={isKYCInProgress}
								variant="primary"
								size="regular"
								theme="light"
								onPress={verifyID}
							>
								{/* eslint-disable-next-line no-nested-ternary */}
								{isKYCInProgress
									? t('KYC in progress...')
									: isIncompletedProfile
									? t('Complete your profile')
									: t('Retry now')}
							</Button>
						) : (
							<ContactUsButton />
						)}
					</View>
				)}
				{!isFailedKYC && !isVerifiedProfile && (
					<View tw="my-4 flex-col justify-start rounded-2xl bg-orange-100 dark:bg-themeOrange p-4">
						<View tw="mb-2 flex-row items-center">
							<AlertTriangle
								width={16}
								height={16}
								color={
									isDark ? colors.white : colors.orange[500]
								}
							/>
							<Text tw="ml-3 text-sm font-bold text-orange-500 dark:text-white">
								{t('Verify your information')}
							</Text>
						</View>
						<View tw="mb-4">
							<Text tw="text-sm text-gray-500 dark:text-white">
								<Trans t={t}>
									In order to validate your account, we have
									to be 100% sure that you are you. As a
									financial service, we need to comply with
									KYC and AML requirements.
								</Trans>
							</Text>
						</View>
						<Button
							tw={isKYCInProgress ? 'opacity-50' : ''}
							disabled={isKYCInProgress}
							variant="primary"
							size="regular"
							theme="light"
							onPress={verifyID}
						>
							{/* eslint-disable-next-line no-nested-ternary */}
							{isKYCInProgress
								? t('KYC In Progress...')
								: isIncompletedProfile
								? t('Complete your profile')
								: t('Verify Now')}
						</Button>
					</View>
				)}
				<HistoricPerformance prices={prices} />
				<UserTokensCard tw="my-4" data={tokens} />
				<UserWalletCard
					tw="my-4"
					title={t('Euro Wallet')}
					visible={!isFailedKYC && isVerifiedProfile}
				/>
			</View>
		</Screen>
	);
}
