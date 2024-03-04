import RawHTML from '@diversifiedfinance/components/raw-html';
import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';

export default function HeadingBlock({
	attrs: { className, content },
}: WP_Block_Parsed) {
	return (
		<View tw={['py-6', className ?? '']}>
			<RawHTML tw={['dark:text-white', className]}>{content}</RawHTML>
		</View>
	);
}
