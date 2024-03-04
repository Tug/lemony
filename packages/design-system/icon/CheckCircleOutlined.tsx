import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

function SvgCheckCircleOutlined(props: SvgProps) {
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width ?? 20}
			height={props.height ?? 21}
			viewBox="0 0 20 21"
			fill="none"
		>
			<Path
				d="M13.825 7.21348L8.33335 12.7051L5.34169 9.72181L4.16669 10.8968L8.33335 15.0635L15 8.39681L13.825 7.21348ZM10 2.56348C5.40002 2.56348 1.66669 6.29681 1.66669 10.8968C1.66669 15.4968 5.40002 19.2301 10 19.2301C14.6 19.2301 18.3334 15.4968 18.3334 10.8968C18.3334 6.29681 14.6 2.56348 10 2.56348ZM10 17.5635C6.31669 17.5635 3.33335 14.5801 3.33335 10.8968C3.33335 7.21348 6.31669 4.23014 10 4.23014C13.6834 4.23014 16.6667 7.21348 16.6667 10.8968C16.6667 14.5801 13.6834 17.5635 10 17.5635Z"
				fill={props.color}
			/>
		</Svg>
	);
}

export default SvgCheckCircleOutlined;
