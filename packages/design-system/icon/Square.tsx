import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

function SvgSquare(props: SvgProps) {
	return (
		<Svg width={20} height={21} viewBox="0 0 20 21" fill="none" {...props}>
			<Path
				d="M2.5 7C2.5 5.59987 2.5 4.8998 2.77248 4.36502C3.01217 3.89462 3.39462 3.51217 3.86502 3.27248C4.3998 3 5.09987 3 6.5 3H13.5C14.9001 3 15.6002 3 16.135 3.27248C16.6054 3.51217 16.9878 3.89462 17.2275 4.36502C17.5 4.8998 17.5 5.59987 17.5 7V14C17.5 15.4001 17.5 16.1002 17.2275 16.635C16.9878 17.1054 16.6054 17.4878 16.135 17.7275C15.6002 18 14.9001 18 13.5 18H6.5C5.09987 18 4.3998 18 3.86502 17.7275C3.39462 17.4878 3.01217 17.1054 2.77248 16.635C2.5 16.1002 2.5 15.4001 2.5 14V7Z"
				stroke={props.color}
				strokeWidth={props.strokeWidth ?? 2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export default SvgSquare;
