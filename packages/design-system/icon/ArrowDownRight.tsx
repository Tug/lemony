import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

function SvgArrowDownRight(props: SvgProps) {
	return (
		<Svg
			width={14}
			height={14}
			viewBox="0 0 24 24"
			fill="none"
			stroke={props.color}
			strokeWidth={props.strokeWidth ?? 3}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<Path d="m7 7 10 10" />
			<Path d="M17 7v10H7" />
		</Svg>
	);
}

export default SvgArrowDownRight;
