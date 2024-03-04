import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

function SvgArrowUpRight(props: SvgProps) {
	return (
		<Svg width={14} height={14} viewBox="0 0 14 14" fill="none" {...props}>
			<Path
				d="M4.08325 9.91634L9.91659 4.08301M9.91659 4.08301H4.08325M9.91659 4.08301V9.91634"
				stroke={props.color}
				strokeWidth={props.strokeWidth ?? 2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export default SvgArrowUpRight;
