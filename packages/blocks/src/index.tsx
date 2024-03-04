import Block, { BlockOverrides } from './block';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';

export const renderBlocks = (
	blocks: WP_Block_Parsed[],
	overrides: BlockOverrides = {}
) => {
	const hasColumns = blocks?.[0]?.blockName === 'core/column';

	if (hasColumns) {
		return (
			<Block
				blockData={{
					blockName: 'core/columns',
					innerBlocks: blocks,
					attrs: {},
					innerContent: [],
					innerHTML: '',
				}}
				overrides={overrides}
			/>
		);
	}

	return blocks.map((block, blockId) => (
		<Block
			key={`block-${blockId}`}
			blockData={block}
			overrides={overrides}
		/>
	));
};
