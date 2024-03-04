import { Chip } from './index';
import { Meta } from '@storybook/react';
import { View } from 'react-native';

export default {
	component: Chip,
	title: 'Components/Chip',
} as Meta;

export const Basic: React.VFC<{}> = () => (
	<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
		<Chip label="Follows You" />
	</View>
);
