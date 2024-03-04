import { View } from '@diversifiedfinance/design-system/view';
import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export const SettingSubTitle = (props: Props) => {
	const children = props.children;
	return (
		<View tw="flex flex-row items-center justify-between px-4 py-4">
			{children}
		</View>
	);
};
