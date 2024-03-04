// SWC cannot transpile flow, see: https://github.com/swc-project/swc/issues/256

import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import RNSegmentedControl from '@react-native-segmented-control/segmented-control';
import { useCallback } from 'react';
import {
	NativeSegmentedControlIOSChangeEvent,
	NativeSyntheticEvent,
} from 'react-native';

type SegmentedControlProps = {
	values: Array<string>;
	selectedIndex: number;
	onChange: (newIndex: number) => void;
};

export const SegmentedControl = (props: SegmentedControlProps) => {
	const isDark = useIsDarkMode();
	const { values, selectedIndex, onChange } = props;
	const handleChange = useCallback(
		(e: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
			onChange?.(e.nativeEvent.selectedSegmentIndex);
		},
		[onChange]
	);

	return (
		<RNSegmentedControl
			values={values}
			selectedIndex={selectedIndex}
			onChange={handleChange}
			style={{
				borderRadius: 8,
				height: 34,
			}}
			backgroundColor={isDark ? colors.gray[900] : colors.gray[100]}
			tintColor={isDark ? '#fff' : colors.diversifiedBlue}
			fontStyle={{
				color: isDark ? colors.gray[400] : colors.gray[600],
				fontWeight: 'bold',
			}}
			activeFontStyle={{
				color: isDark ? colors.gray[900] : colors.white,
				fontWeight: 'bold',
			}}
		/>
	);
};
