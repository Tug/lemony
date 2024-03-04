import React from 'react';
import { View } from '@diversifiedfinance/design-system';
import { Platform } from 'react-native';

export const PortfolioCard = ({
	children,
	tw,
}: {
	children: React.ReactNode | React.ReactNode[];
	tw?: string;
}) => {
	return (
		<View
			tw={[
				'grow flex-col justify-start rounded-2xl bg-white dark:bg-gray-900 py-4 px-2',
				Platform.OS === 'web' ? 'py-6 px-4' : '',
				tw ?? '',
			]}
		>
			{children}
		</View>
	);
};
