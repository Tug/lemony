import { PressableScale, Skeleton } from '@diversifiedfinance/design-system';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';

export interface ProjectRowSkeletonProps {
	itemHeight?: number;
}

export function ProjectRowSkeleton({}: ProjectRowSkeletonProps): React.ReactElement {
	return (
		<PressableScale onPress={() => {}}>
			<View
				tw="mb-2 h-20 rounded-2xl border border-gray-200 p-2"
				dataset={Platform.select({ web: { testId: 'project-row' } })}
			>
				<View tw="w-full flex-row">
					<View tw="w-16">
						<Skeleton width={64} height={64} show />
					</View>
					<View tw="shrink grow">
						<Skeleton width={80} height={20} show />
					</View>
				</View>
			</View>
		</PressableScale>
	);
}
