import { isValidElement, memo, Fragment } from 'react';
import { Platform } from 'react-native';

import { AnimateHeight } from '@diversifiedfinance/design-system/accordion';
import {
	Checkbox,
	CheckboxProps,
} from '@diversifiedfinance/design-system/checkbox';
import { useId } from '@diversifiedfinance/design-system/input';
import { Label } from '@diversifiedfinance/design-system/label';
import { Pressable } from '@diversifiedfinance/design-system/pressable';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { ErrorText } from './fieldset';

export type FieldsetCheckboxProps = Omit<CheckboxProps, 'checked'> & {
	value: boolean;
	Icon?: JSX.Element | React.ReactNode;
	title?: string;
	errorText?: string;
	helperText?: string;
};

const PlatformAnimateHeight =
	Platform.OS === 'web' || Platform.OS === 'android'
		? Fragment
		: AnimateHeight;
function FieldsetCheckboxImpl({
	onChange,
	value,
	Icon,
	errorText,
	helperText,
	...rest
}: FieldsetCheckboxProps) {
	const helperTextId = useId();
	const errorTextId = useId();
	return (
		<View>
			<Pressable
				tw="flex-row justify-between "
				onPress={() => onChange?.(!value)}
			>
				<View tw="flex-row items-center">
					{isValidElement(Icon) && Icon}
					<Label tw="ml-2 font-bold text-gray-900 dark:text-white">
						Make it a Raffle
					</Label>
				</View>
				<Checkbox {...rest} checked={value} onChange={onChange} />
			</Pressable>
			<PlatformAnimateHeight>
				{errorText ? (
					<ErrorText id={errorTextId}>{errorText}</ErrorText>
				) : null}
			</PlatformAnimateHeight>
			<PlatformAnimateHeight>
				{helperText ? (
					<>
						<View tw="mt-3 h-[1px] w-full bg-gray-200 dark:bg-gray-800" />
						<View tw="h-4" />
						<Text
							id={helperTextId}
							tw="text-sm leading-6 text-gray-700 dark:text-gray-300"
						>
							{helperText}
						</Text>
					</>
				) : null}
			</PlatformAnimateHeight>
		</View>
	);
}
export const FieldsetCheckbox = memo(FieldsetCheckboxImpl);
