import {
	Image,
	PressableScale,
	Skeleton,
	Text,
} from '@diversifiedfinance/design-system';
import { View } from '@diversifiedfinance/design-system/view';
import React, { Fragment } from 'react';
import { Divider } from '@diversifiedfinance/design-system/divider';

export interface ProjectRowSkeletonProps {
	itemHeight?: number;
}

export function ProjectRowSkeleton({}: ProjectRowSkeletonProps): React.ReactElement {
	return (
		<View tw="my-2 bg-white dark:bg-gray-900 rounded-2xl">
			<View tw="flex-row justify-items-stretch m-4 pb-2">
				<View tw="flex-row mr-4 h-full items-center">
					<View tw="w-18 h-18">
						<Skeleton width={72} height={72} show />
					</View>
				</View>
				<View tw="shrink grow flex-col">
					<View tw="mt-1">
						<Skeleton width="100%" height={20} show />
					</View>
					<View tw="mt-1">
						<Skeleton width="50%" height={20} show />
					</View>
					<View tw="mt-2">
						<View tw="flex-row items-start justify-between">
							<Skeleton width={52} height={28} show />
							<Skeleton width={24} height={24} show />
						</View>
						<Divider tw="my-3 bg-gray-200 dark:bg-gray-700" />
						<View tw="pl-1 flex-row items-center gap-x-2 justify-start">
							<Skeleton width={42} height={42} show />
							<View tw="mx-2 my-1">
								<Skeleton width={150} height={25} show />
							</View>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}
