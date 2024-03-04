import { useProject } from '@diversifiedfinance/app/hooks/use-project';
import {
	Button,
	Checkbox,
	Spinner,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import React, { useCallback, useState } from 'react';
import { useProjectTokenClaim } from '@diversifiedfinance/app/hooks/api-hooks';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { Keyboard } from 'react-native';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import AlertTriangle from '@diversifiedfinance/design-system/icon/AlertTriangle';
import { Trans, useTranslation } from 'react-i18next';
import { TextLink } from '@diversifiedfinance/app/navigation/link';
import { Label } from '@diversifiedfinance/design-system/label';
import { toast } from '@diversifiedfinance/design-system/toast';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';
import TokenGift from './token-gift.svg';
import { ProjectCardSmall } from '@diversifiedfinance/app/components/project-card';
import type { TokenClaim } from '@diversifiedfinance/types/diversified';

export interface CheckoutProps {
	projectSlug: string;
	onClaimed?: (tokenClaims: TokenClaim[]) => void;
}

export function TokenClaimCheckout({ projectSlug, onClaimed }: CheckoutProps) {
	const { i18n, t } = useTranslation();
	const { isVerifiedProfile } = useUser();
	const { data: project } = useProject(projectSlug);
	const [hasAcceptedTCAndKID, iHaveAcceptedTCAndKID] =
		useState<boolean>(false);
	const [isClaiming, setIsClaiming] = useState<boolean>(false);
	const navigateTo = useNavigateToScreen();
	const {
		amount: tokenClaimAmount,
		data: tokenClaims,
		claim,
	} = useProjectTokenClaim(projectSlug);
	const canClaim = hasAcceptedTCAndKID;
	const tokenName = project?.tokenName ?? '';
	const difiedAmountStr = t('{{count}} DIFIED', {
		count: new Intl.NumberFormat(i18n.language, {
			maximumFractionDigits: 0,
			maximumFractionDigits: 3,
		}).format(tokenClaimAmount),
	});

	const onClaim = useCallback(async () => {
		Keyboard.dismiss();
		Analytics.track(EVENTS.BUTTON_CLICKED, {
			name: 'Claim Token',
		});
		try {
			setIsClaiming(true);
			await claim();
			toast.success(t('Success'));
			Analytics.track(EVENTS.TOKEN_CLAIM, {
				amountTokenOffered: tokenClaimAmount,
				projectSlug,
			});
			onClaimed?.(tokenClaims ?? []);
		} catch (err) {
			toast.error(err?.message);
			// cleanup on payment error if needed
		} finally {
			setIsClaiming(false);
		}
	}, [
		claim,
		setIsClaiming,
		onClaimed,
		tokenClaims,
		tokenClaimAmount,
		projectSlug,
		t,
	]);

	const verifyID = () => {
		navigateTo('kycSettings');
	};

	if (tokenClaimAmount === 0 && !isClaiming) {
		return (
			<View tw="flex-col items-center">
				{project && (
					<ProjectCardSmall
						tw="border border-gray-200 dark:border-gray-700"
						item={project}
						disabled
					/>
				)}
				<View tw="m-4 flex-col items-center">
					<View tw="my-2">
						<Text tw="text-lg font-inter-semibold text-center text-black dark:text-white">
							{t(
								'You already claimed all your DIFIED for this asset.'
							)}
						</Text>
					</View>
					<View tw="my-1 flex-col items-center">
						<View tw="my-1 flex-row items-center">
							<Text tw="text-base text-center text-black dark:text-white">
								{t('Gain more by referring your friends.')}
							</Text>
						</View>
						<Button
							tw="my-4"
							size="regular"
							onPress={() => {
								navigateTo('referAFriend');
							}}
						>
							{t('Refer a friend')}
						</Button>
					</View>
				</View>
			</View>
		);
	}

	return (
		<View tw="mx-4 flex-col justify-center">
			{isClaiming && (
				<View tw="absolute h-full w-full items-center justify-center z-50 bg-white/50">
					<Spinner size="large" />
				</View>
			)}
			<View tw="flex-row justify-between mt-6 mb-2 gap-x-4">
				<View tw="shrink grow flex-col justify-center">
					<Text tw="text-xl font-bold text-black leading-6 dark:text-white">
						<Trans t={t} values={{ difiedAmountStr }}>
							Congratulations{'\n'}
							You won{'\n'}
							<Text tw="font-inter font-bold text-themeOrange">
								{{ difiedAmountStr }}
							</Text>
						</Trans>
					</Text>
				</View>
				<View>
					<TokenGift />
				</View>
			</View>
			<View tw="flex-row items-center justify-between gap-x-4 my-4">
				<View tw="grow shrink">
					<Text tw="text-black dark:text-white">
						<Trans
							t={t}
							values={{
								tokenName,
								count: tokenClaimAmount,
							}}
						>
							Your DIFIED can be used to participate in the sale
							of the{' '}
							<Text tw="font-bold">
								{'"'}
								{{ tokenName }}
								{'"'}
							</Text>{' '}
							asset.
						</Trans>
					</Text>
				</View>
				<View>
					{project && (
						<ProjectCardSmall
							tw="border border-gray-200 dark:border-gray-700"
							item={project}
							disabled
						/>
					)}
				</View>
			</View>
			{!isVerifiedProfile ? (
				<View tw="mb-4 flex-col justify-start rounded-2xl bg-orange-100 p-4 dark:bg-gray-900">
					<View tw="mb-2 flex-row items-center">
						<AlertTriangle
							width={16}
							height={16}
							color={colors.orange[500]}
						/>
						<Text tw="ml-3 text-sm font-bold text-orange-500">
							{t('Verify your information')}
						</Text>
					</View>
					<View tw="mb-4">
						<Text tw="text-sm text-gray-500">
							<Trans t={t}>
								In order to validate your account, we have to be
								100% sure that you are you. As a financial
								service, we need to comply with KYC and AML
								requirements.
							</Trans>
						</Text>
					</View>
					<Button variant="primary" size="regular" onPress={verifyID}>
						{t('Verify Now')}
					</Button>
				</View>
			) : (
				<View>
					<View tw="my-4">
						<View tw="flex-row items-center">
							<Checkbox
								id={`checkbox-kid`}
								onChange={(value) => {
									iHaveAcceptedTCAndKID(value);
								}}
								checked={hasAcceptedTCAndKID}
								aria-label="checkbox-confirm"
								disabled={isClaiming}
							/>
							<Label
								htmlFor={`checkbox-kid`}
								tw="text-sm mx-4 flex-row items-center leading-5 text-black dark:text-white"
							>
								<Trans t={t}>
									I have read the{' '}
									<TextLink
										tw="text-sm font-bold underline"
										href={t(
											'https://www.diversified.fi/kid-security-tokens'
										)}
									>
										{t('Key Information Document')}
									</TextLink>{' '}
									and accept the{' '}
									<TextLink
										tw="text-sm font-bold underline"
										href={project?.documentUrl ?? ''}
									>
										Terms and Conditions
									</TextLink>
									.
								</Trans>
							</Label>
						</View>
					</View>
					<Button
						tw={['my-4', !canClaim ? 'opacity-50' : '']}
						disabled={!canClaim || isClaiming}
						size="regular"
						onPress={onClaim}
					>
						{isClaiming
							? t('Claiming DIFIED...')
							: t('Claim {{count}} DIFIED', {
									count: tokenClaimAmount,
							  })}
					</Button>
				</View>
			)}
			<View tw="h-10" />
		</View>
	);
}
