import { useState } from 'react';

import { BottomSheetScrollView } from '@diversifiedfinance/design-system/bottom-sheet';
import { Button } from '@diversifiedfinance/design-system/button';
import { Close } from '@diversifiedfinance/design-system/icon';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { Modal } from './index';
import { ModalHeader } from './modal.header';

export default {
	component: ModalHeader,
	title: 'Components/Modal',
};

const Container = (props: any) => {
	return <View tw={'bg-black p-10 dark:bg-white'}>{props.children}</View>;
};

export const HeaderDefault = () => {
	return (
		<Container>
			<ModalHeader
				title="Modal Header Title"
				tw={'bg-white dark:bg-black'}
			/>
		</Container>
	);
};

export const HeaderWithEndContent = () => {
	return (
		<Container>
			<ModalHeader
				title="Modal Header Title"
				tw={'bg-white dark:bg-black'}
				endContentComponent={() => (
					<Button size="small" iconOnly>
						<Close />
					</Button>
				)}
			/>
		</Container>
	);
};

export const Default = () => {
	const [visible, setVisible] = useState(false);

	const onClose = () => {
		setVisible(false);
	};
	return (
		<Container>
			<Button onPress={() => setVisible(!visible)}>
				<Text tw="text-white dark:text-black">Open modal</Text>
			</Button>
			{visible && (
				<Modal title="Modal Title" onClose={onClose}>
					<Button size="small" iconOnly>
						<Close />
					</Button>
				</Modal>
			)}
		</Container>
	);
};

export const WithScrollable = () => {
	const [visible, setVisible] = useState(false);

	const onClose = () => {
		console.log('onClose');
		setVisible(false);
	};
	return (
		<Container>
			<Button onPress={() => setVisible(!visible)}>Open modal</Button>
			{visible && (
				<Modal title="Modal Title" onClose={onClose}>
					<BottomSheetScrollView>
						{Array(50)
							.fill(0)
							.map((_, index) => (
								<Text
									key={`${index}-item`}
									tw="p-1 text-white"
								>{`#${index} item`}</Text>
							))}
					</BottomSheetScrollView>
				</Modal>
			)}
		</Container>
	);
};
