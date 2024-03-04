import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { View } from '@diversifiedfinance/design-system/view';
import { useWindowDimensions } from 'react-native';
import { Pressable } from '@diversifiedfinance/design-system';
import { HeaderDropdown } from '@diversifiedfinance/app/components/header-dropdown';
import { Button } from '@diversifiedfinance/design-system/button';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useTranslation } from 'react-i18next';

type HeaderRightProps = {
	withBackground?: boolean;
};

export const HeaderRight = ({ withBackground }: HeaderRightProps) => {
	const { t } = useTranslation();
	const { isLoading, isAuthenticated } = useUser();
	const { width } = useWindowDimensions();
	const navigateTo = useNavigateToScreen();
	const isMdWidth = width >= breakpoints.md;

	if (isLoading) {
		return null;
	}

	return (
		<View>
			{!isLoading && (
				<View tw="flex-row items-center">
					{isAuthenticated && isMdWidth && (
						<>
							<View tw="mx-2"></View>
							<View tw="mx-2"></View>
						</>
					)}
					<View tw="flex-row items-center md:mx-2">
						{isAuthenticated ? (
							<HeaderDropdown
								type={isMdWidth ? 'profile' : 'settings'}
								withBackground={withBackground}
							/>
						) : (
							<>
								{isMdWidth && <View tw="mx-3"></View>}
								{withBackground ? (
									<>
										<Pressable
											onPress={() => {
												navigateTo('login');
											}}
											tw="h-8 items-center justify-center rounded-full bg-black/30 px-4"
										>
											<Text tw="text-sm font-semibold text-white">
												{t('Sign In')}
											</Text>
										</Pressable>
										<Pressable
											onPress={() => {
												navigateTo('onboardingSignUp');
											}}
											tw="h-8 items-center justify-center rounded-full bg-black/30 px-4"
										>
											<Text tw="text-sm font-semibold text-white">
												{t('Sign Up')}
											</Text>
										</Pressable>
									</>
								) : (
									<>
										<Button
											onPress={() => {
												navigateTo('login');
											}}
											variant="text"
											size="regular"
											labelTW="font-semibold"
										>
											{t('Sign In')}
										</Button>
										<Button
											onPress={() => {
												navigateTo('onboardingSignUp');
											}}
											variant="primary"
											size="regular"
											labelTW="font-semibold"
										>
											{t('Sign Up')}
										</Button>
									</>
								)}
							</>
						)}
						{/*{Platform.OS === "web" ? <NetworkButton /> : null} */}
					</View>
				</View>
			)}
		</View>
	);
};
