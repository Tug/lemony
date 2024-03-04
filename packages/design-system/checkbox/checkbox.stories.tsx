import React from 'react';

import { Checkbox } from '@diversifiedfinance/design-system/checkbox';
import { Label } from '@diversifiedfinance/design-system/label';
import { View } from '@diversifiedfinance/design-system/view';

export default {
	component: Checkbox,
	title: 'Components/Checkbox',
};

export const Primary = () => {
	const [checked, setChecked] = React.useState(false);

	return (
		<View tw="flex-row items-center">
			<Checkbox
				id="checkbox"
				aria-label="I agree"
				checked={checked}
				onChange={setChecked}
			/>
			<Label
				htmlFor="checkbox"
				tw="ml-2 flex-row items-center text-black dark:text-white"
			>
				I agree
			</Label>
		</View>
	);
};
