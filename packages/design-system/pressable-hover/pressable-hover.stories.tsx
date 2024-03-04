import { PressableHover } from './index';
import { Text } from '@diversifiedfinance/design-system/text';
import { Meta } from '@storybook/react';

export default {
	component: PressableHover,
	title: 'Components/PressableHover',
} as Meta;

export const Primary: React.VFC<{}> = () => (
	<PressableHover tw="w-auto rounded-full bg-black p-2 dark:bg-white">
		<Text tw="text-center text-white dark:text-black">Press Me</Text>
	</PressableHover>
);
