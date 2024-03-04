import * as React from 'react';
import Svg, { SvgProps, G, Path, Rect } from 'react-native-svg';

const SvgDiversified = (props: SvgProps) => (
	<Svg width={24} height={24} viewBox="-2 0 22 24" fill="none" {...props}>
		<G>
			<Path
				d="M6.22488 2.07764C6.22488 1.8007 6.00039 1.5759 5.72314 1.5759H0.995801C0.720789 1.5759 0.471998 1.68718 0.291641 1.86754C0.111604 2.0479 0 2.29669 0 2.5717V10.7648C0 11.0875 0.300275 11.326 0.614621 11.2535L5.83634 10.0479C6.06403 9.99544 6.2252 9.7927 6.2252 9.55925V2.07764H6.22488Z"
				fill={props.color ?? '#155EEF'}
			/>
			<Path
				d="M0.475836 13.8932C0.197305 13.9575 0 14.2057 0 14.4915V21.8072C0 22.1366 0.133669 22.4349 0.349522 22.6508C0.565375 22.8666 0.863731 23.0003 1.19311 23.0003H7.62264C10.5144 23.0003 13.1328 21.8283 15.0278 19.933C15.2155 19.7452 15.3962 19.5502 15.5692 19.3484C15.7966 19.0833 15.7544 18.681 15.4794 18.4661L7.77038 12.443C7.62424 12.3289 7.43461 12.287 7.25425 12.3285L0.475836 13.8932Z"
				fill={props.color ?? '#2732FF'}
			/>
			<Path
				d="M16.1525 15.4775C16.354 15.6348 16.6479 15.5894 16.7892 15.3767C17.5813 14.1846 18.0427 12.7542 18.0427 11.2157C18.0427 9.51576 17.4764 7.94851 16.5222 6.69144C16.3725 6.49414 16.0879 6.46184 15.8954 6.61789L10.8835 10.6766C10.6635 10.8547 10.6663 11.1917 10.8895 11.366L16.1522 15.4775H16.1525Z"
				fill={props.color ?? '#246DFF'}
			/>
			<Path
				d="M8.81927 0.533089V7.69876C8.81927 8.14678 9.33859 8.39461 9.68684 8.11256L15.3476 3.52849C15.6025 3.32223 15.6121 2.93721 15.3681 2.71816C14.3467 1.80166 12.201 0.195719 9.38304 0.00129174C9.07733 -0.0198139 8.81927 0.226738 8.81927 0.533089Z"
				fill={props.color ?? '#27B2FF'}
			/>
		</G>
	</Svg>
);

export default SvgDiversified;
