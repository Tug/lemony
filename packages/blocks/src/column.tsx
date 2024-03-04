import { renderBlocks } from './index';
import { View } from '@diversifiedfinance/design-system';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';
import type { BlockOverrides } from './block';

export default function ColumnBlock({
	index,
	totalColumns,
	attrs: { className, width },
	innerBlocks,
	overrides,
}: WP_Block_Parsed & {
	overrides: BlockOverrides;
	index: number;
	totalColumns: number;
}) {
	const customStyle = {
		...(width && { width }),
	};
	return (
		<View
			tw={['grow', className, 'dark:bg-transparent']}
			style={customStyle}
		>
			{renderBlocks(innerBlocks, overrides)}
		</View>
	);
}
