import { View, Text } from '@diversifiedfinance/design-system';
import Screen from '@diversifiedfinance/app/components/screen';
import React from 'react';
import { InfiniteScrollList } from '@diversifiedfinance/design-system/infinite-scroll-list';
import { useTokensPriceHistory } from '@diversifiedfinance/app/hooks/api-hooks';
import { Platform, useWindowDimensions } from 'react-native';
import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';
import { TokenPriceRow } from '@diversifiedfinance/app/components/token-price-row';

export function Market({ useWindowScroll = true }) {
	const { data: tokenPrices } = useTokensPriceHistory();
	const bottomBarHeight = usePlatformBottomHeight();
	const { height: windowHeight } = useWindowDimensions();

	return (
		<View tw="w-full flex-1 bg-blueGray-100 dark:bg-black">
			<InfiniteScrollList
				useWindowScroll={useWindowScroll}
				renderItem={({ item }) => (
					<TokenPriceRow key={item.code} {...item} />
				)}
				data={tokenPrices?.data}
				estimatedItemSize={340}
				style={{
					height: Platform.select({
						default: windowHeight - bottomBarHeight,
						web: useWindowScroll
							? windowHeight - bottomBarHeight
							: undefined,
					}),
				}}
				contentContainerStyle={Platform.select({
					default: {
						paddingBottom: bottomBarHeight,
					},
					web: {},
				})}
			/>
		</View>
	);
}
