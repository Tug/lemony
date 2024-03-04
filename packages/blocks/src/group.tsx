import { renderBlocks } from './index';
import { View } from '@diversifiedfinance/design-system';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';
import type { BlockOverrides } from './block';

export default function GroupBlock({
	attrs: { className },
	innerBlocks,
	overrides,
}: WP_Block_Parsed & { overrides: BlockOverrides }) {
	return <View tw={className}>{renderBlocks(innerBlocks, overrides)}</View>;
}
