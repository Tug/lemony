import { Button } from '@diversifiedfinance/design-system/button';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { View } from '@diversifiedfinance/design-system/view';

import { HeaderDropdown } from '@diversifiedfinance/app/components/header-dropdown';
import { NotificationsSettingIcon } from '@diversifiedfinance/app/components/header/notifications-setting-icon';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { SWIPE_LIST_SCREENS } from '@diversifiedfinance/app/lib/constants';
import {
	useNavigateToLogin,
	useNavigateToOnboarding,
	useNavigateToScreen,
} from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useTranslation } from 'react-i18next';

type HeaderRightProps = {
	withBackground?: boolean;
};
export const HeaderRightSm = ({ withBackground }: HeaderRightProps) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { isLoading, isAuthenticated, user } = useUser();
	const navigateTo = useNavigateToScreen();
	const redirectToOnboarding = useNavigateToOnboarding();

	if (router.pathname === '/notifications') {
		return <NotificationsSettingIcon />;
	}

	return (
		<View>
			{!isLoading && (
				<View tw="flex-row items-center">
					<View tw="flex-row items-center md:mx-2">
						{isAuthenticated ? (
							<HeaderDropdown
								type="settings"
								withBackground={withBackground}
								user={user?.data.profile}
							/>
						) : withBackground ? (
							<View tw="flex-row">
								<Button
									onPress={() =>
										redirectToOnboarding('onboardingSignUp')
									}
									theme={
										SWIPE_LIST_SCREENS.includes(
											router.pathname
										)
											? 'dark'
											: undefined
									}
								>
									{t('Sign Up')}
								</Button>
								<Button
									variant="text"
									onPress={() => navigateTo('login')}
									theme={
										SWIPE_LIST_SCREENS.includes(
											router.pathname
										)
											? 'dark'
											: undefined
									}
								>
									{t('Sign In')}
								</Button>
							</View>
						) : (
							<View tw="flex-row">
								<Button
									onPress={() =>
										redirectToOnboarding('onboardingSignUp')
									}
								>
									{t('Sign Up')}
								</Button>
								<Button
									variant="text"
									onPress={() => navigateTo('login')}
								>
									{t('Sign In')}
								</Button>
							</View>
						)}
					</View>
				</View>
			)}
		</View>
	);
};
