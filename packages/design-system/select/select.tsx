import { SelectButton } from './lib/select-button';
import { SelectItem } from './lib/select-item';
import { SelectOption, SelectProps } from './types';
import { useCallback, useState } from 'react';
import { BottomSheet } from '@diversifiedfinance/design-system/bottom-sheet';
import { View } from '@diversifiedfinance/design-system';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area/index.web';

export function Select<T>({
	size = 'regular',
	value,
	placeholder = 'Select item',
	options = [],
	disabled,
	onChange,
}: SelectProps<T>) {
	const [open, setOpen] = useState(false);
	const { bottom } = useSafeAreaInsets();
	const estimatedHeight = bottom + 20 + 48 * options.length;
	//#region callbacks
	const handleSelectItemPress = useCallback(
		(value: T) => {
			setOpen(false);
			if (onChange) {
				onChange(value);
			}
		},
		[onChange, setOpen]
	);
	const handleSelectButtonPress = useCallback(
		() => setOpen((state) => !state),
		[]
	);
	const handleSheetDismiss = useCallback(() => {
		setOpen(false);
	}, []);
	//#endregion

	const label =
		value !== undefined
			? options?.filter((t) => t.value === value)?.[0]?.label
			: undefined;

	return (
		<>
			<SelectButton
				open={open}
				label={label ?? placeholder}
				isPlaceholder={label === undefined}
				size={size}
				disabled={disabled}
				onPress={handleSelectButtonPress}
			/>
			<BottomSheet
				visible={open}
				snapPoints={[estimatedHeight, '85%']}
				onDismiss={handleSheetDismiss}
			>
				<View>
					{(options ?? []).map((item: SelectOption<T>) => (
						<SelectItem
							key={`select-item-${item.value}`}
							value={item.value}
							label={item.label}
							size={size}
							// @ts-ignore
							onPress={handleSelectItemPress}
						/>
					))}
				</View>
			</BottomSheet>
		</>
	);
}
