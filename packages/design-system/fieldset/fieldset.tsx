import {
	MutableRefObject,
	ComponentType,
	forwardRef,
	isValidElement,
} from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';

import { AnimateHeight } from '@diversifiedfinance/design-system/accordion';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useId } from '@diversifiedfinance/design-system/input';
import { Label } from '@diversifiedfinance/design-system/label';
import { Select } from '@diversifiedfinance/design-system/select';
import type { SelectProps } from '@diversifiedfinance/design-system/select';
import { Switch } from '@diversifiedfinance/design-system/switch';
import type { SwitchProps } from '@diversifiedfinance/design-system/switch';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Text } from '@diversifiedfinance/design-system/text';
import { TextInput } from '@diversifiedfinance/design-system/text-input';
import type { TextInputProps } from '@diversifiedfinance/design-system/text-input';
import { View } from '@diversifiedfinance/design-system/view';

export type FieldsetProps = {
	errorText?: any;
	label?: string | JSX.Element;
	helperText?: string | JSX.Element;
	helperTextTw?: string;
	disabled?: boolean;
	tw?: string;
	select?: SelectProps;
	switchProps?: SwitchProps;
	selectOnly?: boolean;
	switchOnly?: boolean;
	leftElement?: React.ReactNode;
	rightElement?: React.ReactNode;
	Component?: ComponentType;
	required?: boolean;
	componentRef?: MutableRefObject<ComponentType | undefined>;
	containerStyle?: StyleProp<ViewStyle>;
} & TextInputProps;

function FieldsetImpl(props: FieldsetProps, ref: any) {
	const {
		errorText,
		helperText,
		helperTextTw = '',
		label,
		disabled,
		select,
		switchProps,
		tw: twProp = '',
		leftElement,
		rightElement,
		selectOnly,
		switchOnly,
		required,
		Component = TextInput,
		containerStyle,
		...textInputProps
	} = props;
	const isDark = useIsDarkMode();
	const inputId = useId();
	const helperTextId = useId();
	const errorTextId = useId();

	return (
		<View
			tw={[
				// 'rounded-2xl bg-gray-100 p-4 dark:bg-gray-900',
				disabled ? 'opacity-40' : '',
				switchOnly
					? 'flex-1 flex-row items-center justify-between'
					: '',
				twProp,
			]}
			style={containerStyle}
		>
			{label ? (
				<View tw="flex-row">
					{isValidElement(label) ? (
						label
					) : (
						<Label
							htmlFor={inputId}
							tw="font-bold text-gray-900 dark:text-white"
						>
							{label}
						</Label>
					)}

					{required ? <Text tw="ml-1 text-red-500">*</Text> : null}
				</View>
			) : null}

			<View tw="ml-auto">
				{switchProps ? <Switch {...switchProps} /> : null}
			</View>
			{!switchProps ? (
				<View
					tw={[
						'h-12 flex-row items-center justify-center rounded-full bg-gray-100 p-4 dark:bg-gray-900',
						label ? 'mt-3' : '',
					]}
				>
					{leftElement}
					{!selectOnly ? (
						<Component
							tw="w-full flex-1 text-base text-black focus-visible:ring-1 dark:text-white"
							style={[{ fontSize: 16 }]}
							ref={ref}
							id={inputId}
							multiline={textInputProps.multiline}
							numberOfLines={textInputProps.numberOfLines ?? 1}
							blurOnSubmit={textInputProps.blurOnSubmit}
							textAlignVertical="top"
							placeholderTextColor={
								isDark ? colors.gray[400] : colors.gray[600]
							}
							selectionColor={
								isDark ? colors.gray[300] : colors.gray[700]
							}
							aria-describedby={Platform.select({
								web: helperText ? helperTextId : undefined,
								default: undefined,
							})}
							aria-errormessage={Platform.select({
								web: errorText ? errorTextId : undefined,
								default: undefined,
							})}
							aria-required={true}
							aria-invalid={Platform.select({
								web: errorText ? true : false,
								default: undefined,
							})}
							// @ts-ignore
							readOnly={disabled}
							{...textInputProps}
						/>
					) : null}

					{select ? (
						<Select disabled={disabled} size="small" {...select} />
					) : null}
					{rightElement}
				</View>
			) : null}

			<AnimateHeight>
				{errorText ? (
					<ErrorText id={errorTextId}>{errorText}</ErrorText>
				) : null}
			</AnimateHeight>
			<AnimateHeight
				extraHeight={Platform.select({
					ios: 0,
					default: 4,
				})}
			>
				{helperText ? (
					<>
						<View tw="mt-3 h-[1px] w-full bg-gray-200 dark:bg-gray-800" />
						<View tw="h-4" />
						<Text
							id={helperTextId}
							tw={[
								'text-sm leading-6 text-gray-700 dark:text-gray-300',
								helperTextTw,
							]}
						>
							{helperText}
						</Text>
					</>
				) : null}
			</AnimateHeight>
		</View>
	);
}

export const ErrorText = ({ children, id }: { children: any; id?: string }) => {
	return (
		<>
			<View tw="h-4" />
			<Text id={id} tw="text-sm font-semibold leading-6 text-red-500">
				{children}
			</Text>
		</>
	);
};

export const Fieldset = forwardRef(FieldsetImpl);
