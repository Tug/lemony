import { CardSkeleton } from '@diversifiedfinance/app/components/card/card-skeleton';
import { useContentWidth } from '@diversifiedfinance/app/hooks/use-content-width';
import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';
import { View } from '@diversifiedfinance/design-system/view';
import { memo } from 'react';

type ProjectFooterProps = {
	isLoading: boolean;
	numColumns?: number;
};

export const ProjectFooter = memo(
	({ isLoading, numColumns = 3 }: ProjectFooterProps) => {
		const contentWidth = useContentWidth();
		const squareSize = contentWidth / numColumns;
		const tabBarHeight = usePlatformBottomHeight();

		if (isLoading) {
			return (
				<View
					style={{ marginBottom: tabBarHeight }}
					tw="mt-0 flex-row md:mt-4"
				>
					{new Array(numColumns).fill(0).map((_, i) => (
						<CardSkeleton
							squareSize={squareSize}
							spacing={32}
							key={`Card-Skeleton-${i}`}
						/>
					))}
				</View>
			);
		}
		return <View style={{ height: tabBarHeight }} tw="mb-4" />;
	}
);

ProjectFooter.displayName = 'ProjectFooter';
