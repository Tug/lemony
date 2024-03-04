import ColumnBlock from './column';
import { View } from '@diversifiedfinance/design-system';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';

export default function ColumnsBlock({
	attrs: { className },
	innerBlocks,
}: WP_Block_Parsed) {
	const columns = innerBlocks.filter(
		({ blockName }) => blockName === 'core/column'
	);
	return (
		<View
			tw={[
				'w-full rounded-xl bg-blue-100 dark:bg-gray-900 px-2 py-4',
				className ?? '',
			]}
		>
			<View tw="w-full flex-row items-start">
				{columns.map((block, index) => (
					<ColumnBlock
						key={`column-${index}`}
						index={index}
						totalColumns={columns.length}
						{...block}
					/>
				))}
			</View>
		</View>
	);
}
