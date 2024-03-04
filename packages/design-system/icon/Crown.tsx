import * as React from 'react';

import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCrown = (props: SvgProps) => (
	<Svg width={25} height={16} viewBox="0 0 25 16" fill="none" {...props}>
		<Path
			d="M4.63536 14.1548L5.09912 15.545C5.20174 15.8539 5.53673 16.0601 5.87173 15.9826C7.80323 15.5702 9.96601 15.3126 12.2588 15.3126C14.5505 15.3126 16.7144 15.544 18.6459 15.9826C18.9809 16.0601 19.3159 15.88 19.4185 15.545L19.8823 14.1548C17.5645 13.6135 14.9892 13.3047 12.2588 13.3047C9.5284 13.3057 6.95317 13.6145 4.63536 14.1548Z"
			fill={props.color}
		/>
		<Path
			d="M22.1476 3.72414C21.4011 3.87906 20.7824 4.47058 20.6285 5.21804C20.4998 5.86188 20.6798 6.42825 21.041 6.86585L16.6892 9.13236C16.2767 9.33859 15.7878 9.18366 15.5564 8.79736L12.8001 3.80171C13.7276 3.51801 14.3453 2.61664 14.1652 1.56137C14.0364 0.814932 13.4188 0.196232 12.6713 0.0423292C11.4098 -0.215205 10.3022 0.737465 10.3022 1.94767C10.3022 2.82287 10.8947 3.57034 11.6925 3.80171L8.9371 8.77238C8.70572 9.18484 8.2158 9.31361 7.80436 9.10738L3.45255 6.84087C3.81268 6.40327 3.99378 5.8369 3.86501 5.19306C3.71009 4.44663 3.11858 3.82793 2.34597 3.69916C1.1096 3.46778 0.0543327 4.36916 0.00200176 5.52806C-0.0241534 6.01697 0.20823 6.5069 0.568371 6.8419C1.31481 7.58834 1.90734 7.58834 2.42241 7.45957L4.27645 13.0478C6.67172 12.4814 9.37589 12.1464 12.2337 12.1464C15.0929 12.1464 17.797 12.4553 20.191 13.0478L22.0451 7.45957C22.5863 7.58834 23.1527 7.58834 23.9253 6.81574C24.2854 6.4556 24.4916 5.99183 24.4665 5.47676C24.4404 4.36816 23.3588 3.49277 22.1476 3.72414Z"
			fill={props.color}
		/>
	</Svg>
);

export default SvgCrown;
