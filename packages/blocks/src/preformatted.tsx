import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';

export default function PreformattedBlock({
	attrs: { content },
}: WP_Block_Parsed) {
	return (
		<View tw="my-2">
			<Text tw="text-black dark:text-white">{content ?? ''}</Text>
		</View>
	);
}
