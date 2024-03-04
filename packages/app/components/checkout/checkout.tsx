import { useProject } from '@diversifiedfinance/app/hooks/use-project';
import {
	Button,
	Checkbox,
	Spinner,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import React, { useCallback, useMemo, useState } from 'react';
import {
	useCreditsWallet,
	useEurWallet,
	useProjectTokenClaim,
} from '@diversifiedfinance/app/hooks/api-hooks';
import {
	MAX_AMOUNT_EUR_CREDIT_CARD,
	MIN_AMOUNT_DIFIED,
	MIN_AMOUNT_DIFIED_FOR_CUSTOMER,
	DEFAULT_AMOUNT_DIFIED_ON_CHECKOUT,
} from '@diversifiedfinance/app/lib/constants';
import {
	fromMangopayMoney,
	printMoney,
} from '@diversifiedfinance/app/lib/mangopay';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { Dimensions, Keyboard, Platform } from 'react-native';
import {
	addFees,
	computeFees,
	DecimalMath,
	difiedToEUR,
	eurToDIFIED,
	subFees,
	difiedNumber,
} from './currency-utils';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import AlertTriangle from '@diversifiedfinance/design-system/icon/AlertTriangle';
import { Trans, useTranslation } from 'react-i18next';
import { TextLink } from '@diversifiedfinance/app/navigation/link';
import { Label } from '@diversifiedfinance/design-system/label';
import {
	Basket,
	useCheckout,
} from '@diversifiedfinance/app/hooks/use-checkout';
import { toast } from '@diversifiedfinance/design-system/toast';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import Slider from '@react-native-community/slider';
import i18n from '@diversifiedfinance/app/lib/i18n';
import debounce from 'lodash/debounce';
import { SelectPaymentOptionInline } from '@diversifiedfinance/app/components/payment/select-payment-option/inline';
import { PayButton } from '@diversifiedfinance/app/components/payment/pay-button';
import { PaymentOption } from '@diversifiedfinance/app/components/payment/select-payment-option/types';
import { useFeature } from '@growthbook/growthbook-react';
import { Help } from '@diversifiedfinance/design-system/icon';
import { useIntercom } from '@diversifiedfinance/app/lib/intercom';

export interface CheckoutProps {
	projectSlug: string;
	onPaid?: (basket: Basket) => void;
}

export function Checkout({ projectSlug, onPaid }: CheckoutProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const oneDifiedMinimum = useFeature('one-dified-minimum').on;
	const { isVerifiedProfile, user, isLoading: isLoadingUser } = useUser();
	const isCustomer = user?.data.profile.labels?.find(
		(label) => label === 'customer'
	);
	const [currencyTarget, setCurrencyTarget] = useState<'eur' | 'dified'>(
		'dified'
	);
	const intercom = useIntercom();
	const { data: project } = useProject(projectSlug);
	const { isPaying, pay } = useCheckout(projectSlug);
	const { data: eurWallet } = useEurWallet();
	const { data: creditsWallet } = useCreditsWallet();
	const [isCrediting, setCrediting] = useState<boolean>(false);
	const [hasReadTheKID, iHaveReadTheKID] = useState<boolean>(false);
	const [hasAcceptedTC, iHaveAcceptedTC] = useState<boolean>(false);
	const [currentPaymentOption, setCurrentPaymentOption] = useState<
		PaymentOption | undefined
	>();
	const navigateTo = useNavigateToScreen();
	const walletBalance = fromMangopayMoney(eurWallet?.balance ?? 0);
	const freeCreditsBalance = creditsWallet?.balance ?? 0;
	const feesPercent =
		(user?.data.overrides?.project?.feesPercent ??
			project?.feesPercent ??
			0) / 100;
	const totalCreditsBalance = DecimalMath.add(
		walletBalance,
		freeCreditsBalance
	);
	// minimumValue and maximumValue cannot	be changed dynamically
	// on the slider
	const isSliderReady = !isLoadingUser;

	const { minAmount, minDifiedAmount, maxAmount, maxDifiedAmount } =
		useMemo(() => {
			const amountLeftOnProject =
				project && project.crowdfundingState
					? DecimalMath.sub(
							project.crowdfundingState.maximumAmount,
							project.crowdfundingState.collectedAmount
					  )
					: Infinity;
			const maxAvailableAmount = DecimalMath.add(
				totalCreditsBalance,
				MAX_AMOUNT_EUR_CREDIT_CARD
			);
			const maxDifiedAmount = Math.min(
				eurToDIFIED(amountLeftOnProject),
				eurToDIFIED(maxAvailableAmount)
			);
			const maxAmount = addFees(
				difiedToEUR(maxDifiedAmount),
				feesPercent
			);
			// Round down max if it is not equal to amountLeftOnProject
			// if (
			// 	!Number.isInteger(maxDifiedAmount) &&
			// 	maxDifiedAmount !== amountLeftOnProject
			// ) {
			// 	maxDifiedAmount = Math.floor(maxDifiedAmount);
			// 	maxAmount = difiedToEUR(maxDifiedAmount);
			// }
			const minDifiedAmount = Math.min(
				isCustomer && oneDifiedMinimum
					? MIN_AMOUNT_DIFIED_FOR_CUSTOMER
					: MIN_AMOUNT_DIFIED,
				maxDifiedAmount
			);
			const minAmount = addFees(
				difiedToEUR(minDifiedAmount),
				feesPercent
			);
			return {
				minDifiedAmount,
				minAmount,
				maxAmount,
				maxDifiedAmount,
			};
		}, [
			totalCreditsBalance,
			project?.crowdfundingState,
			feesPercent,
			isCustomer,
			oneDifiedMinimum,
		]);
	const [difiedValueSource, setDifiedValue] = useState<number>(
		Math.min(DEFAULT_AMOUNT_DIFIED_ON_CHECKOUT, maxDifiedAmount)
	);
	const [eurValueSource, setEurValueSource] = useState<number>(
		difiedToEUR(difiedValueSource)
	);
	const eurValue =
		currencyTarget === 'dified'
			? difiedToEUR(difiedValueSource)
			: eurValueSource;
	const amountIncludeFees = currencyTarget === 'eur';
	const fees = computeFees(eurValue, feesPercent, amountIncludeFees);
	const eurValueWithFees =
		currencyTarget === 'dified'
			? DecimalMath.add(eurValue, fees)
			: eurValue;
	const eurValueWithoutFees = DecimalMath.sub(eurValueWithFees, fees);
	const difiedValue =
		currencyTarget === 'dified'
			? difiedValueSource
			: eurToDIFIED(eurValueWithoutFees);
	const orderAmount = eurValueWithoutFees;
	const orderFees = fees;
	const orderAmountWithFees = eurValueWithFees;
	const canBuy =
		orderAmountWithFees >= minAmount && orderAmountWithFees <= maxAmount;
	const freeCreditsUsed = Math.min(freeCreditsBalance, orderAmountWithFees);
	const walletBalanceUsed = Math.min(
		walletBalance,
		Math.max(0, orderAmountWithFees - freeCreditsBalance)
	);
	const canPay = hasReadTheKID && hasAcceptedTC && !isPaying;
	const missingAmount = Math.max(
		0,
		DecimalMath.sub(eurValueWithFees, totalCreditsBalance)
	);
	const setDifiedValueDecimal = useCallback(
		(value: number) => {
			if (currencyTarget === 'eur') {
				setCurrencyTarget('dified');
			}
			setDifiedValue(difiedNumber(value));
		},
		[currencyTarget, setDifiedValue]
	);

	const onSliderChangeDebounced = useMemo(
		() => debounce(setDifiedValueDecimal, 100, { maxWait: 100 }),
		[setDifiedValueDecimal]
	);

	const onUseFreeCreditsPressed = useCallback(() => {
		if (freeCreditsBalance > 0) {
			const value = Math.min(maxAmount, freeCreditsBalance);
			const eur = !value || Number.isNaN(value) || value < 0 ? 0 : value;
			const eurWithBounds = Math.max(0, Math.min(maxAmount, eur));
			const dified = eurToDIFIED(subFees(eurWithBounds, feesPercent));
			setDifiedValue(dified);
		}
	}, [freeCreditsBalance, maxAmount, setDifiedValue, feesPercent]);

	const onUseAllCreditsPressed = useCallback(() => {
		if (walletBalance + freeCreditsBalance > 0) {
			const value = Math.min(
				maxAmount,
				DecimalMath.add(freeCreditsBalance, walletBalance)
			);
			const eur = !value || Number.isNaN(value) || value < 0 ? 0 : value;
			const eurWithBounds = Math.max(0, Math.min(maxAmount, eur));
			// const dified = eurToDIFIED(subFees(eurWithBounds, feesPercent, 3));
			// console.log({
			// 	eur,
			// 	eurWithBounds,
			// 	dified,
			// 	eurValueWithoutFees: subFees(eurWithBounds, feesPercent, 3),
			// });
			// setDifiedValue(dified);
			setEurValueSource(eurWithBounds);
			setCurrencyTarget('eur');
		}
	}, [
		walletBalance,
		freeCreditsBalance,
		maxAmount,
		setDifiedValue,
		feesPercent,
	]);

	const onBuy = useCallback(async () => {
		Keyboard.dismiss();
		Analytics.track(
			EVENTS.BUTTON_CLICKED,
			{
				name: 'buy',
			},
			{
				revenue: orderFees,
			}
		);
		try {
			const basket = {
				products: [
					{
						totalEur: orderAmountWithFees,
						fees: orderFees,
						amountToken: difiedValue,
						projectSlug,
					},
				],
			};
			const order = await pay(basket);
			toast.success(t('Success'));
			Analytics.track(EVENTS.PURCHASE, {
				basket,
				eurValue: orderAmount,
				eurValueWithFees: orderAmountWithFees,
				fees: orderFees,
				amountTokenPaid: difiedValue,
				amountTokenOffered: 0,
				amountTokenTotal: difiedValue,
				difiedValue,
				projectSlug,
			});
			onPaid?.(basket);
		} catch (err) {
			toast.error(err.message);
			// cleanup on payment error if needed
		}
	}, [
		orderAmount,
		orderAmountWithFees,
		orderFees,
		difiedValue,
		projectSlug,
		onPaid,
		pay,
		t,
	]);

	const verifyID = () => {
		navigateTo('kycSettings');
	};

	return (
		<View tw="mx-4 flex-col justify-center">
			{isPaying && (
				<View tw="absolute h-full w-full items-center justify-center z-50 bg-white/50">
					<Spinner size="large" />
				</View>
			)}
			<View tw="dark:border-gray-800 rounded-xl mb-4 bg-homeLightBlue dark:bg-gray-900">
				<View tw="my-4 items-center">
					<Text tw="text-xs text-gray-800 dark:text-gray-200">
						{t('How many DIFIED do you want to buy?')}
					</Text>
				</View>
				<View tw="items-center justify-between w-full w-[70%] mx-auto">
					<View tw="mb-2">
						<Text tw="text-4xl font-inter font-bold text-black dark:text-white">
							{difiedValue}
						</Text>
					</View>
					<View tw="my-1">
						<Text tw="font-semibold text-xs text-black dark:text-white text-center">
							{project?.tokenName}
						</Text>
					</View>
				</View>
				<View
					tw={[
						'mx-4',
						Platform.OS === 'android' ? 'my-4' : 'mt-1 mb-2',
					]}
				>
					{isSliderReady && (
						<Slider
							value={difiedValue}
							onValueChange={onSliderChangeDebounced}
							step={1}
							minimumValue={minDifiedAmount}
							maximumValue={maxDifiedAmount}
							minimumTrackTintColor={
								isDark
									? colors.themeYellow
									: colors.diversifiedBlue
							}
							maximumTrackTintColor={
								isDark ? colors.gray[800] : colors.blueGray[300]
							}
							thumbTintColor={
								isDark
									? colors.themeYellow
									: colors.diversifiedBlue
							}
							style={{
								height: 16,
								...(Platform.OS === 'android' && {
									transform: [
										{ scaleX: 1.5 },
										{ scaleY: 1.5 },
									],
									// width calculation is hacky at the moment
									width:
										(Dimensions.get('window').width - 32) /
										1.5,
									alignSelf: 'center',
								}),
							}}
						/>
					)}
				</View>
			</View>
			{totalCreditsBalance > 0 && (
				<View tw="mb-2 w-fulljustify-between rounded-2xl border border-gray-200 px-4 py-1">
					{freeCreditsBalance > 0 && (
						<View tw="flex-row items-center justify-between">
							<View tw="my-3">
								<Text tw="text-sm text-black dark:text-white">
									{t('Free credits')}
								</Text>
							</View>
							<View tw="flex-row items-center">
								{freeCreditsUsed !== freeCreditsBalance && (
									<Button
										size="small"
										variant="tertiary"
										onPress={onUseFreeCreditsPressed}
									>
										{t('Use All')}
									</Button>
								)}
								<View tw="ml-2">
									<Text tw="text-base font-bold text-black dark:text-white">
										{printMoney(freeCreditsBalance)}
									</Text>
								</View>
							</View>
						</View>
					)}
					{walletBalance > 0 && (
						<View tw="flex-row items-center justify-between mt-1">
							<View tw="my-3">
								<Text tw="text-sm text-black dark:text-white">
									{t('Wallet balance')}
								</Text>
							</View>
							<View tw="flex-row items-center">
								{walletBalanceUsed !== walletBalance && (
									<Button
										size="small"
										variant="tertiary"
										onPress={onUseAllCreditsPressed}
									>
										{t('Use All')}
									</Button>
								)}
								<View tw="ml-2">
									<Text tw="text-base font-bold text-black dark:text-white">
										{printMoney(walletBalance)}
									</Text>
								</View>
							</View>
						</View>
					)}
				</View>
			)}
			<View tw="flex-col my-4">
				<View tw="mb-6 items-center">
					<Text tw="font-bold text-base text-black dark:text-white">
						{t('Order Summary')}
					</Text>
				</View>
				<View tw="m-1 gap-y-2">
					<View tw="flex-row items-center justify-between w-full">
						<View>
							<Text tw="text-black dark:text-white">
								{t('Quantity')}
							</Text>
						</View>
						<View>
							<Text tw="text-black dark:text-white">
								{difiedValue}
							</Text>
						</View>
					</View>
					<View tw="flex-row items-center justify-between w-full">
						<View>
							<Text tw="text-black dark:text-white">
								{t('Price per DIFIED')}
							</Text>
						</View>
						<View>
							<Text tw="text-black dark:text-white">
								{printMoney(10)}
							</Text>
						</View>
					</View>
					<View tw="flex-row items-center justify-between w-full">
						<View>
							<Text tw="text-black dark:text-white">
								{t('Subtotal')}
							</Text>
						</View>
						<View>
							<Text tw="text-black dark:text-white">
								{printMoney(eurValueWithoutFees)}
							</Text>
						</View>
					</View>
					<View tw="flex-row items-center justify-between w-full">
						<View tw="flex-row items-center">
							<Text tw="text-black dark:text-white">
								{t('{{feesPercent}} Service fee', {
									feesPercent: new Intl.NumberFormat(
										i18n.language,
										{
											style: 'percent',
											minimumFractionDigits: 0,
											maximumFractionDigits: 2,
										}
									).format(feesPercent),
								})}
							</Text>
							<Button
								tw="mx-1"
								variant="text"
								size="xs"
								iconOnly
								onPress={() =>
									intercom.showContent({
										type: 'ARTICLE',
										id: '7888699',
									})
								}
							>
								<Help
									color={
										isDark
											? colors.gray[400]
											: colors.gray[600]
									}
									width={16}
									height={16}
								/>
							</Button>
						</View>
						<View>
							<Text tw="text-black dark:text-white">
								{printMoney(fees)}
							</Text>
						</View>
					</View>
					<View tw="flex-row items-center justify-between w-full">
						<View>
							<Text tw="font-bold text-black dark:text-white">
								{t('Total amount')}
							</Text>
						</View>
						<View>
							<Text tw="font-bold text-black dark:text-white">
								{printMoney(eurValueWithFees)}
							</Text>
						</View>
					</View>

					{freeCreditsUsed > 0 && (
						<View tw="flex-row items-center justify-between w-full">
							<View tw="flex-row items-center">
								<Text tw="text-black dark:text-white">
									{t('Free credits')}
								</Text>
							</View>
							<View>
								<Text tw="text-black dark:text-white">
									-{printMoney(freeCreditsUsed)}
								</Text>
							</View>
						</View>
					)}

					{walletBalanceUsed > 0 && (
						<View tw="flex-row items-center justify-between w-full">
							<View tw="flex-row items-center">
								<Text tw="text-black dark:text-white">
									{t('Wallet credits')}
								</Text>
							</View>
							<View>
								<Text tw="text-black dark:text-white">
									-{printMoney(walletBalanceUsed)}
								</Text>
							</View>
						</View>
					)}

					{totalCreditsBalance > 0 && (
						<View tw="flex-row items-center justify-between w-full">
							<View>
								<Text tw="font-bold text-black dark:text-white">
									{t('Pay now')}
								</Text>
							</View>
							<View>
								<Text tw="font-bold text-black dark:text-white">
									{printMoney(missingAmount)}
								</Text>
							</View>
						</View>
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
					{missingAmount > 0 && (
						<View tw="my-2">
							<SelectPaymentOptionInline
								selectedPaymentOption={currentPaymentOption}
								onChange={setCurrentPaymentOption}
							/>
						</View>
					)}
					<View tw="my-4">
						<View tw="flex-row items-center">
							<Checkbox
								id={`checkbox-kid`}
								onChange={(value) => {
									iHaveReadTheKID(value);
									iHaveAcceptedTC(value);
								}}
								checked={hasReadTheKID && hasAcceptedTC}
								aria-label="checkbox-confirm"
								disabled={isPaying || isCrediting}
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
					<PayButton
						disabled={!canPay || !canBuy}
						isPaying={isPaying || isCrediting}
						paymentOption={currentPaymentOption}
						amountEur={missingAmount}
						onPress={() => setCrediting(true)}
						onComplete={() => {
							setCrediting(false);
							onBuy();
						}}
						ctaText={
							missingAmount > 0
								? t('Pay {{amount}}', {
										amount: printMoney(missingAmount),
								  })
								: t('Get {{difiedValue}} DIFIED', {
										difiedValue,
								  })
						}
					/>
				</View>
			)}
			<View tw="h-10" />
		</View>
	);
}
