import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';

const sanitizeHeight = (heightText: string) => {
	try {
		return parseInt(heightText, 10);
	} catch (err) {
		return 0;
	}
};
export default function SpacerBlock({
	attrs: { height: heightString, className },
}: WP_Block_Parsed) {
	const height = sanitizeHeight(heightString);
	return <View style={{ height }} tw={className ?? ''}></View>;
}
