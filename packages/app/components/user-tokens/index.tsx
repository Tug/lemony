import { TokenRow } from './token-row';
import { InfiniteScrollList } from '@diversifiedfinance/design-system/infinite-scroll-list';
import { View } from '@diversifiedfinance/design-system/view';
import { ListRenderItemInfo } from '@shopify/flash-list';
import React from 'react';
import { useCallback } from 'react';

interface TokenResponseItem {
	label: string;
	amount: number;
	description: string;
	projectSlug: string;
}

export default function UserTokens({ data }: { data: TokenResponseItem[] }) {
	const Separator = useCallback(
		() => <View tw="h-[1px] bg-gray-200 dark:bg-gray-800" />,
		[]
	);
	const renderItem = useCallback(
		({ item }: ListRenderItemInfo<TokenResponseItem>) => {
			return <TokenRow item={item} />;
		},
		[]
	);

	return (
		<InfiniteScrollList<TokenResponseItem>
			data={data}
			renderItem={renderItem}
			ItemSeparatorComponent={Separator}
			keyboardShouldPersistTaps="handled"
			estimatedItemSize={64}
		/>
	);
}
