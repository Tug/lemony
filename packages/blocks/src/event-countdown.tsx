import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';

export default function EventCountdownBlock({
	attrs: { className, eventTimestamp },
}: WP_Block_Parsed) {
	const daysLeft = Math.ceil(
		(eventTimestamp - Date.now() / 1000) / (3600 * 24)
	);
	return (
		<View>
			<Text tw={className}>{daysLeft}</Text>
		</View>
	);
}
