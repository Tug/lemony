import { Skeleton } from '@diversifiedfinance/design-system';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { Divider } from '@diversifiedfinance/design-system/divider';

export interface ProjectRowSkeletonProps {
	itemHeight?: number;
}

export function ProjectCardBaseSkeleton({}: ProjectRowSkeletonProps): React.ReactElement {
	return (
		<View tw="py-4 w-full">
			<View tw="w-full">
				<View
					tw="w-full flex-col items-stretch justify-end bg-white dark:bg-gray-900 rounded-2xl"
					style={{ height: 400 }}
				>
					<View tw="shrink grow basis-0">
						<Skeleton width="100%" height={220} show />
					</View>
					<View tw="flex-col px-4 py-1">
						<View tw="mt-1">
							<Skeleton width="100%" height={20} show />
						</View>
						<View tw="mt-1">
							<Skeleton width={64} height={20} show />
						</View>
						<Divider tw="mt-3 mb-1 bg-gray-200 dark:bg-gray-700" />
						<View tw="m-2 flex-col justify-center">
							<View tw="flex-row items-center gap-x-2 justify-start">
								<Skeleton width={42} height={42} show />
								<View tw="mx-2 my-1">
									<Skeleton width={150} height={25} show />
								</View>
							</View>
						</View>
						<View tw="my-2">
							<Skeleton width="100%" height={28} show />
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}
