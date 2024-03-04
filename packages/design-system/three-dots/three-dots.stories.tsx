import { ThreeDotsAnimation } from '.';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Meta } from '@storybook/react';

export default {
	component: ThreeDotsAnimation,
	title: 'Components/ThreeDotsAnimation',
} as Meta;

export const Basic: React.VFC<{}> = () => (
	<View tw="flex-1 items-center justify-center">
		<Text tw="text-lg text-white dark:text-white">
			Collecting
			<ThreeDotsAnimation color="#000" />
		</Text>
	</View>
);
