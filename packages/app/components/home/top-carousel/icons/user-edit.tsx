import Svg, { Path } from 'react-native-svg';

export function UserEdit({ color = '#242C89' }: { color?: string }) {
	return (
		<Svg
			width="33"
			height="38"
			viewBox="0 0 33 38"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<Path
				d="M15 17C17.4853 17 19.5 14.9853 19.5 12.5C19.5 10.0147 17.4853 8 15 8C12.5147 8 10.5 10.0147 10.5 12.5C10.5 14.9853 12.5147 17 15 17Z"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M17 21.223C16.357 21.077 15.687 21 15 21C10.029 21 6 25.029 6 30H14"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M22 28L18 29L19 25L24 20L27 23L22 28Z"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				opacity="0.07"
				d="M20.2639 3.44832C20.4311 4.86177 20.2639 6.32354 20.7003 7.68062C21.8669 11.329 26.4801 12.4082 29.4332 14.8888C34.071 18.7828 34.0057 26.4461 30.2817 31.2019C26.5576 35.9577 20.1496 38.0436 14.0598 37.9993C11.4575 37.9792 8.78988 37.5966 6.53424 36.3201C2.56954 34.0731 0.554561 29.43 0.101802 24.94C-0.134774 22.6084 -0.00832848 20.1721 1.0114 18.054C1.94547 16.117 3.5648 14.5747 4.5886 12.6821C6.44451 9.25917 6.85648 4.41478 10.3072 2.02682C13.4194 -0.127586 19.6561 -1.69809 20.2679 3.45235L20.2639 3.44832Z"
				fill={color}
			/>
		</Svg>
	);
}
