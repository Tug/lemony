import { CircularProgress } from '@diversifiedfinance/components/circular-progress';
import { Text, View } from '@diversifiedfinance/design-system';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import React from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { WP_Block_Parsed } from 'wp-types';

export default function CircularProgressBlock({
	attrs: { content, className },
}: WP_Block_Parsed) {
	const numericValue = Number((content ?? '').replace(/\D/g, ''));
	const percentProgress = numericValue / 100;
	return (
		<View tw="mx-auto">
			<CircularProgress
				size={52}
				strokeColor={colors.primary[500]}
				strokeWidth={6}
				progress={percentProgress}
				strokeLinecap="round"
			>
				<Text tw={className}>{`${numericValue}%`}</Text>
			</CircularProgress>
		</View>
	);
}
