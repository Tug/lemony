import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import LoginModal from '@diversifiedfinance/app/components/login/modal';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LoginPage = () => {
	useTrackPageViewed({ name: 'login' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Sign In'));
	}, [modalScreenContext, t]);
	return <LoginModal />;
};

export const LoginScreen = withModalScreen(LoginPage, {
	title: 'Sign In',
	matchingPathname: '/login',
	matchingQueryParam: 'loginModal',
	snapPoints: ['90%'],
	web_height: `max-h-[100vh] md:max-h-[95vh]`,
	disableBackdropPress: true,
});

export const SignupPage = () => {
	useTrackPageViewed({ name: 'signup' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Sign Up'));
	}, [modalScreenContext, t]);
	return <LoginModal />;
};

export const SignupScreen = withModalScreen(SignupPage, {
	title: 'Sign Up',
	matchingPathname: '/signup',
	matchingQueryParam: 'signupModal',
	snapPoints: ['90%'],
	web_height: `max-h-[100vh] md:max-h-[95vh]`,
	disableBackdropPress: true,
});
