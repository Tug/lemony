import { renderBlocks } from './index';
import { View, Text } from '@diversifiedfinance/design-system';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';
import type { BlockOverrides } from './block';

export default function TabBlock({
	attrs: { className, label },
	innerBlocks,
	overrides,
}: WP_Block_Parsed & { overrides: BlockOverrides }) {
	return (
		<View tw={className ?? ''}>
			<View tw="pt-4 pb-2">
				<Text tw="font-bold dark:text-white text-2xl">{label}</Text>
			</View>
			{renderBlocks(innerBlocks, overrides)}
			<View tw="h-10"></View>
		</View>
	);
}
