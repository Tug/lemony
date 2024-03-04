import { Button, Image, Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useTranslation } from 'react-i18next';
import DiversifiedWordmark from '@diversifiedfinance/design-system/icon/DiversifiedWordmark';
import { useComponentSize } from '@diversifiedfinance/app/hooks/use-component-size';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';

export const Slide: React.FC<{}> = ({ title, subtitle, tw, theme }) => {
	const { t } = useTranslation();
	const navigateToScreen = useNavigateToScreen();
	const { top: safeAreaTop } = useSafeAreaInsets();
	const {
		onLayout,
		size: { width, height },
	} = useComponentSize();

	const longestWordLength = title
		.split(' ')
		.sort((a, b) => b.length - a.length)[0].length;
	const availableSpaceForTitle = Math.round(
		(0.004 * (width * height)) /
			(2 * Math.log(title.length + longestWordLength))
	);
	const titleFontSize = Math.min(Math.max(30, availableSpaceForTitle), 65);

	return (
		<View tw="h-full w-full transparent">
			<View tw={['absolute h-full w-full -z-10', tw]}>
				<View
					tw={[
						'absolute left-4',
						safeAreaTop > 0 ? 'top-8' : 'top-16',
					]}
					style={{ marginTop: safeAreaTop }}
				>
					<DiversifiedWordmark
						color={theme === 'dark' ? 'white' : 'black'}
						width={122}
						height={24}
					/>
				</View>
			</View>
			<View tw="absolute top-[50%] bottom-16 w-full px-4 justify-end">
				<View tw="shrink grow justify-end mb-[5%]" onLayout={onLayout}>
					<Text
						tw={[
							'truncate text-center font-bricktext',
							theme === 'dark' ? 'text-white' : '',
						]}
						style={{
							fontSize: titleFontSize,
						}}
					>
						{title}
					</Text>
				</View>
				<View tw="mx-4">
					<View tw="mb-2">
						<Text
							tw={[
								'text-center mr-4 mt-2 text-sm',
								theme === 'dark' ? 'text-white' : '',
							]}
						>
							{subtitle}
						</Text>
					</View>
					<View tw="py-4 flex-row gap-4 mx-auto items-center">
						<View tw="flex-1">
							<Button
								size="regular"
								variant="outlined"
								theme={theme}
								onPress={() =>
									navigateToScreen('onboardingSignUp')
								}
							>
								{t('Sign Up')}
							</Button>
						</View>
						<View tw="flex-1">
							<Button
								size="regular"
								variant="text"
								theme={theme}
								onPress={() =>
									navigateToScreen('onboardingSignIn')
								}
							>
								{t('Sign In')}
							</Button>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
};
