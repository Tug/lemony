import { Text, View, ScrollView } from '@diversifiedfinance/design-system';
import React, { ReactNode, useCallback, useEffect } from 'react';
import { ViewProps } from 'react-native';
import SignupProgress from './signup-progress';
import { HeaderLeft } from '../../header';
import { useNavigation } from '../../../lib/react-navigation/native';
import { AllRoutesParams } from '@diversifiedfinance/app/navigation/lib/get-path';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { CardImageCarousel } from './card-image-carousel';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { PortalProvider } from '@gorhom/portal';

export interface OnboardingScreenProps extends ViewProps {
	title: ReactNode;
	subtitle?: ReactNode;
	stepNumber?: number;
	stepCount?: number;
	stepName?: string;
	canGoBack?: boolean | (() => Promise<boolean>);
	showCarousel?: boolean;
	isForm?: boolean;
	previousScreen?: keyof AllRoutesParams;
	isModal?: boolean;
}

export default function OnboardingScreen({
	title,
	subtitle,
	stepNumber,
	stepCount,
	stepName,
	canGoBack = true,
	showCarousel = false,
	isModal = false,
	previousScreen,
	children,
}: OnboardingScreenProps) {
	const navigation = useNavigation();
	const router = useRouter();
	const isDark = useIsDarkMode();
	const navigateTo = useNavigateToScreen(true);
	const { top, bottom } = useSafeAreaInsets();
	const backButtonVisible =
		Boolean(previousScreen) ||
		Boolean(canGoBack && navigation.canGoBack?.());

	const onBackPressHandler = useCallback(async () => {
		if (typeof canGoBack === 'boolean' && !canGoBack) {
			return;
		}
		if (typeof canGoBack === 'function' && !(await canGoBack())) {
			return;
		}
		if (navigation.canGoBack?.()) {
			router.pop();
		} else if (previousScreen) {
			navigateTo(previousScreen);
		}
	}, [canGoBack, navigateTo, navigation, previousScreen, router]);

	// WARNING: this is preventing navigation to other navigators (push or replace)
	//  TODO: debug with android and iOS
	// useEffect(() => {
	// 	// handle back button on android
	// 	return navigation.addListener('beforeRemove', (event) => {
	// 		if (!navigation.isFocused()) {
	// 			return;
	// 		}
	// 		event.preventDefault();
	// 		// onBackPressHandler();
	// 	});
	// }, []);

	return (
		<View tw="flex-1 w-full h-full bg-white dark:bg-black">
			<PortalProvider>
				{!isModal && (
					<View tw="absolute left-3 z-50" style={{ top }}>
						<View tw="h-8 w-8">
							<HeaderLeft
								canGoBack={backButtonVisible}
								onBackPress={onBackPressHandler}
								color={isDark ? '#fff' : '#000'}
							/>
						</View>
					</View>
				)}
				<ScrollView
					contentContainerStyle={{
						paddingTop: !isModal ? Math.max(top, 20) : 0,
						paddingBottom: Math.max(bottom, 12),
						flexGrow: 1,
					}}
				>
					<View tw="w-full items-stretch my-4">
						{!isModal && showCarousel && (
							<View tw="items-center">
								<CardImageCarousel width={120} height={150} />
							</View>
						)}
						{!isModal && (
							<View tw="mx-4 my-4 min-h-16 flex-row items-center justify-between">
								<View tw="my-1">
									<Text tw="font-inter-bold text-4xl font-bold dark:text-white">
										{title}
									</Text>
								</View>
								<SignupProgress
									stepName={stepName}
									stepNumber={stepNumber}
									stepCount={stepCount}
								/>
							</View>
						)}
						{subtitle && (
							<View tw="px-4 py-2">
								<Text tw="font-inter text-left text-sm dark:text-white">
									{subtitle}
								</Text>
							</View>
						)}
					</View>
					{children}
				</ScrollView>
			</PortalProvider>
		</View>
	);
}
