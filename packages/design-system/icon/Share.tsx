import * as React from 'react';
import Svg, { G, SvgProps, Path } from 'react-native-svg';
import { Platform } from 'react-native';

const SvgShare = (props: SvgProps) => {
	if (Platform.OS === 'android') {
		// entypo share
		return (
			<Svg
				viewBox="0 0 20 20"
				width="128"
				height="128"
				fill="currentColor"
				{...props}
			>
				<G>
					<Path d="M15 13.442c-.633 0-1.204.246-1.637.642l-5.938-3.463c.046-.188.075-.384.075-.584s-.029-.395-.075-.583L13.3 6.025A2.48 2.48 0 0 0 15 6.7c1.379 0 2.5-1.121 2.5-2.5S16.379 1.7 15 1.7s-2.5 1.121-2.5 2.5c0 .2.029.396.075.583L6.7 8.212A2.485 2.485 0 0 0 5 7.537c-1.379 0-2.5 1.121-2.5 2.5s1.121 2.5 2.5 2.5a2.48 2.48 0 0 0 1.7-.675l5.938 3.463a2.339 2.339 0 0 0-.067.546A2.428 2.428 0 1 0 15 13.442z" />
				</G>
			</Svg>
		);
	}

	// entypo share-alternative
	return (
		<Svg
			viewBox="0 0 20 20"
			width="128"
			height="128"
			fill="currentColor"
			{...props}
		>
			<G>
				<Path d="M9 13h2V4h2l-3-4-3 4h2v9zm8-6h-3v2h2v9H4V9h2V7H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z" />
			</G>
		</Svg>
	);
};

export default SvgShare;
