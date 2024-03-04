import { Text } from '@diversifiedfinance/design-system/text';

import { PressableScale } from './index';

export default {
	component: PressableScale,
	title: 'Components/PressableScale',
};

export const Primary = () => (
	<PressableScale
		style={{
			padding: 8,
			width: 'auto',
			borderRadius: 9999,
			backgroundColor: 'blue',
		}}
	></PressableScale>
);
