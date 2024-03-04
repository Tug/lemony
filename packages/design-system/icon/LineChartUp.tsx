import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

function SvgLineChartUp(props: SvgProps) {
	return (
		<Svg width={21} height={20} viewBox="0 0 21 20" fill="none" {...props}>
			<Path
				d="M19.1665 19H2.7665C2.20645 19 1.92643 19 1.71251 18.891C1.52435 18.7951 1.37137 18.6422 1.2755 18.454C1.1665 18.2401 1.1665 17.9601 1.1665 17.4V1M18.1665 6L14.2476 10.1827C14.0991 10.3412 14.0249 10.4204 13.9353 10.4614C13.8562 10.4976 13.7691 10.5125 13.6825 10.5047C13.5844 10.4958 13.488 10.4458 13.2952 10.3457L10.0378 8.65433C9.84504 8.55423 9.74865 8.50418 9.65054 8.49534C9.56394 8.48753 9.47681 8.50245 9.39774 8.5386C9.30815 8.57957 9.23389 8.65883 9.08537 8.81734L5.1665 13"
				stroke={props.color ?? '#98A2B3'}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export default SvgLineChartUp;
