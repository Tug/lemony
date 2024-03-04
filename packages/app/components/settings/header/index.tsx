import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import {
	DEFAULT_HEADER_HEIGHT,
	Header,
	HeaderLeft,
} from '@diversifiedfinance/app/components/header';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { Platform, useWindowDimensions } from 'react-native';
import { breakpoints } from '@diversifiedfinance/design-system/theme';

export type SettingsHeaderProps = {
	title?: string;
	headerRight?: React.ReactElement | null;
};

const SettingsHeader = ({ title, headerRight }: SettingsHeaderProps) => {
	const isDark = useIsDarkMode();
	const { width } = useWindowDimensions();
	const isSmWidth = width <= breakpoints.sm;
	const headerHeight = DEFAULT_HEADER_HEIGHT;
	const { top } = useSafeAreaInsets();

	return (
		<>
			{Platform.OS !== 'web' ? (
				<Header
					headerLeft={<HeaderLeft canGoBack={true} withBackground />}
					headerRight={headerRight}
					headerCenter={
						<View tw="flex h-full justify-center">
							<Text tw="font-inter text-base tracking-tight font-bold text-gray-900 dark:text-white">
								{title}
							</Text>
						</View>
					}
					color={isDark ? colors.black : colors.white}
				/>
			) : (
				<View tw="flex-row">
					{isSmWidth && (
						<HeaderLeft canGoBack={true} withBackground />
					)}
					<View tw="pt-8 px-4 grow">
						<Text tw="text-xl font-bold text-gray-900 dark:text-white">
							{title}
						</Text>
					</View>
					<View tw="p-4">{headerRight}</View>
				</View>
			)}
			<View
				style={{
					height: top + headerHeight,
				}}
			></View>
		</>
	);
};

export default SettingsHeader;
