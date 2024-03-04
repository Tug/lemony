import { useState } from 'react';

import { Button } from '@diversifiedfinance/design-system/button';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { BottomSheet } from './index';

export default {
	component: BottomSheet,
	title: 'Components/BottomSheet',
};

const Container = (props: any) => {
	return <View tw={'bg-white p-10 dark:bg-gray-100'}>{props.children}</View>;
};

export const Basic = () => {
	const [visible, setVisible] = useState(false);
	return (
		<Container>
			<Button onPress={() => setVisible(!visible)}>
				Open bottom sheet
			</Button>
			<BottomSheet visible={visible} onDismiss={() => setVisible(false)}>
				<View>
					<Text tw="text-black dark:text-white">Hello world</Text>
				</View>
			</BottomSheet>
		</Container>
	);
};
