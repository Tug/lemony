import React, {
	useMemo,
	useState,
	useRef,
	useEffect,
	useCallback,
} from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Accordion } from '@diversifiedfinance/design-system/accordion';

import { yup } from '@diversifiedfinance/app/lib/yup';

import { LoginButton } from './login-button';
import { LoginFooter } from './login-footer';
import { LoginHeader } from './login-header';
import { LoginInputField } from './login-input-field';
import { LoginOverlays } from './login-overlays';
import { LoginWithApple } from './login-with-apple';
import { LoginWithGoogle } from './login-with-google';
import { PhoneNumberPicker } from '../phone-number-picker';
import { useFeature } from '@growthbook/growthbook-react';
import { ActivationCodeField } from '@diversifiedfinance/app/components/login/activation-code-field';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { useAlert } from '@diversifiedfinance/design-system/alert';
import { useNavigateToOnboarding } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { useTranslation } from 'react-i18next';
import i18n from '@diversifiedfinance/app/lib/i18n';
import { useIsOnline } from '@diversifiedfinance/app/hooks/use-is-online';

class WrongFlowError extends Error {
	public readonly ctaText: string;
	public readonly ctaScreen: string;

	constructor({ isSignup }: { isSignup: boolean }) {
		super(
			isSignup
				? i18n.t('Account already exists. Please sign in.')
				: i18n.t('Account does not exist. Please sign up first.')
		);
		this.ctaText = isSignup
			? i18n.t('Go to Login')
			: i18n.t('Go to Signup');
		this.ctaScreen = isSignup ? 'onboardingSignIn' : 'onboardingSignUp';
	}
}

class WrongActivationCodeError extends Error {
	public readonly title: string;
	constructor() {
		super(
			i18n.t(
				'This referral code is invalid. Please try again with a valid code.'
			)
		);
		this.title = i18n.t('Sorry :(');
	}
}

const accountExists = async (data: {
	email?: string;
	phoneNumber?: string;
}): Promise<boolean> => {
	const { exists } = await axios({
		url: '/api/user/exist',
		method: 'post',
		data,
	});
	return exists;
};

const activationCodeCheck = async (data: {
	email?: string;
	phoneNumber?: string;
	activationCode: string;
}): Promise<boolean> => {
	const { valid } = await axios({
		url: '/api/user/activation-code-check',
		method: 'post',
		data,
	});
	return valid;
};

interface LoginComponentProps {
	tw?: string;
	handleSubmitEmail: (email: string, extraData?: any) => Promise<void>;
	handleSubmitPhoneNumber: (
		phoneNumber: string,
		extraData?: any
	) => Promise<void>;
	onLogin?: () => void;
	loading: boolean;
	fromModal: boolean;
	isSignup: boolean;
}

const { useParam } = createParam<{ code: string }>();

/*
 * Requires a <PortalProvider> mounted all the way up in the hierarchy
 * So that the magic modal can function properly
 */
export function LoginComponent({
	handleSubmitEmail,
	handleSubmitPhoneNumber,
	onLogin,
	loading,
	tw = '',
	fromModal,
	isSignup,
}: LoginComponentProps) {
	const { t } = useTranslation();
	const [activationCodeInitial] = useParam('code');
	const [activationCode, setActivationCode] = useState<string>(
		activationCodeInitial ?? ''
	);
	const [showEmailLogin, setShowEmailLogin] = useState(false);
	const socialConnectDisabled = useFeature('social-login').off;
	const navigateToOnboarding = useNavigateToOnboarding();
	const [accordionValue, setAccordionValue] = useState(
		activationCodeInitial ? 'open' : ''
	);
	const { isOnline } = useIsOnline();

	const emailValidationSchema = useMemo(
		() =>
			yup
				.object({
					data: yup
						.string()
						.email(t('Please enter a valid email address.'))
						.required(t('Please enter a valid email address.')),
				})
				.required(),
		[t]
	);

	const textInputRef = useRef<TextInput>();
	const Alert = useAlert();

	useEffect(() => {
		if (textInputRef.current && showEmailLogin) {
			textInputRef.current.focus();
		}
	}, [showEmailLogin]);

	useEffect(() => {
		if (activationCodeInitial) {
			setActivationCode(activationCodeInitial);
		}
	}, [activationCodeInitial]);

	const withErrorHandler =
		(submitHandler: (...params: any[]) => Promise<void>) =>
		async (...params: any[]) => {
			try {
				return await submitHandler(...params);
			} catch (error) {
				if (error instanceof WrongFlowError) {
					const ctaScreen = error.ctaScreen;
					Alert.alert('404', error.message, [
						{
							text: t('Dismiss'),
						},
						{
							text: error.ctaText,
							onPress() {
								navigateToOnboarding(ctaScreen);
							},
						},
					]);
					return;
				}

				Alert.alert(
					error.title ?? t('Error'),
					error?.message ?? error.toString()
				);
			}
		};

	const onEmailSubmit = useCallback(
		withErrorHandler(async (email: string) => {
			if (!isOnline) {
				throw new Error(t('No internet connection'));
			}
			if (!isSignup && !(await accountExists({ email }))) {
				throw new WrongFlowError({ isSignup });
			}
			if (
				isSignup &&
				!(await activationCodeCheck({
					email,
					activationCode,
				}))
			) {
				throw new WrongActivationCodeError();
			}
			return handleSubmitEmail(email, {
				activationCode,
			});
		}),
		[handleSubmitEmail, isSignup, activationCode, isOnline]
	);

	const onPhoneNumberSubmit = useCallback(
		withErrorHandler(async (phoneNumber: string) => {
			if (!isOnline) {
				throw new Error(t('No internet connection'));
			}
			if (!isSignup && !(await accountExists({ phoneNumber }))) {
				throw new WrongFlowError({ isSignup });
			}
			if (
				isSignup &&
				!(await activationCodeCheck({
					phoneNumber,
					activationCode,
				}))
			) {
				throw new WrongActivationCodeError();
			}
			return handleSubmitPhoneNumber(phoneNumber, {
				activationCode,
			});
		}),
		[handleSubmitPhoneNumber, isSignup, activationCode, isOnline]
	);

	const activationCodeElement = useMemo(() => {
		if (activationCodeInitial) {
			return (
				<View tw="mt-4">
					<ActivationCodeField
						label={t('Invitation Code')}
						placeholder={t('Enter your invite code')}
						value={activationCode}
						onChange={setActivationCode}
						disabled
					/>
				</View>
			);
		}
		return (
			<Accordion.Root
				value={accordionValue}
				onValueChange={setAccordionValue}
			>
				<Accordion.Item tw="-mx-4" value="open">
					<Accordion.Trigger>
						<View tw="flex-1">
							<View tw="flex-1 flex-row justify-between">
								<Accordion.Label tw="font-regular text-gray-700 dark:text-gray-200">
									{t('I have an invitation code')}
								</Accordion.Label>
								<Accordion.Chevron />
							</View>
						</View>
					</Accordion.Trigger>
					<Accordion.Content tw="pt-0 pb-0">
						<ActivationCodeField
							placeholder={t('Enter your invite code')}
							value={activationCode}
							onChange={setActivationCode}
						/>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		);
	}, [t, activationCode, activationCodeInitial]);

	//#endregion
	return (
		<View tw={tw}>
			<View tw={['px-4', showEmailLogin ? 'flex' : 'hidden']}>
				<LoginInputField
					key="login-email-field"
					validationSchema={emailValidationSchema}
					label={t('Email address')}
					placeholder={t('Enter your email address')}
					inputMode="email"
					textContentType="emailAddress"
					signInButtonLabel={t('Send Email')}
					onSubmit={onEmailSubmit}
					textInputRef={textInputRef}
					bottomElement={isSignup && activationCodeElement}
					autoComplete="email"
				/>
				<LoginButton
					onPress={() => setShowEmailLogin(false)}
					type="social"
				/>
			</View>
			<View style={{ display: showEmailLogin ? 'none' : 'flex' }}>
				{fromModal && <LoginHeader isSignup={isSignup} />}
				<View tw="flex px-4">
					<View tw="mb-4">
						<PhoneNumberPicker
							isSignup={isSignup}
							handleSubmitPhoneNumber={onPhoneNumberSubmit}
							bottomElement={isSignup && activationCodeElement}
						/>
					</View>
					<View tw="mx-[-16px] mb-[8px] flex-row items-center">
						<View tw="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
						<Text tw="mx-2 text-center text-sm font-bold text-gray-600 dark:text-gray-400">
							{t('OR')}
						</Text>
						<View tw="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
					</View>
					{!socialConnectDisabled && (
						<>
							<LoginWithApple onLogin={onLogin} />
							<LoginWithGoogle onLogin={onLogin} />
						</>
					)}
					<LoginButton
						onPress={() => setShowEmailLogin(true)}
						type="email"
					/>
					<View tw="my-3">
						<LoginFooter isSignup={isSignup} tw="mt-4" />
					</View>
				</View>
			</View>
			<LoginOverlays loading={loading} />
		</View>
	);
}
