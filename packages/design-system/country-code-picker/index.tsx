import { getCountryList, CountryDataType } from './country-code-data';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import Check from '@diversifiedfinance/design-system/icon/Check';
import { InfiniteScrollList } from '@diversifiedfinance/design-system/infinite-scroll-list';
import { PressableScale } from '@diversifiedfinance/design-system/pressable-scale';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { ListRenderItemInfo } from '@shopify/flash-list';
import {
	createContext,
	memo,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
} from 'react-native-reanimated';

type CountryCodePickerProps = {
	value?: string;
	onChange: (value: string) => void;
	data?: CountryDataType[];
	style?: StyleProp<ViewStyle>;
	tw?: string;
	isNationality?: boolean;
	showDialCode?: boolean;
};

const PickerContext = createContext<any>(null);

export const CountryCodePicker = ({
	data,
	onChange,
	value,
	isNationality = false,
	showDialCode = true,
	tw,
	style,
}: CountryCodePickerProps) => {
	const sharedValue = useSharedValue(value);

	useEffect(() => {
		sharedValue.value = value;
	}, [sharedValue, value]);

	const contextValue = useMemo(() => {
		return {
			sharedValue,
			onChange: (item: CountryDataType) => {
				sharedValue.value = item.code;
				onChange(item.code);
			},
		};
	}, [onChange, sharedValue]);
	const renderItem = useCallback(
		({ item }: ListRenderItemInfo<CountryDataType>) => {
			return (
				<PickerItem
					item={item}
					isNationality={isNationality}
					showDialCode={showDialCode}
				/>
			);
		},
		[isNationality]
	);
	const ItemSeparatorComponent = useCallback(
		() => <View tw="h-[1px] w-full bg-gray-200 dark:bg-gray-800" />,
		[]
	);
	const keyExtractor = useCallback((item: CountryDataType) => item.code, []);
	return (
		<PickerContext.Provider value={contextValue}>
			<View
				tw={['flex-1 bg-white dark:bg-black', tw ?? '']}
				style={style}
			>
				<InfiniteScrollList
					useWindowScroll={false}
					data={data ?? getCountryList()}
					keyExtractor={keyExtractor}
					renderItem={renderItem}
					ItemSeparatorComponent={ItemSeparatorComponent}
					keyboardShouldPersistTaps="handled"
					estimatedItemSize={64}
				/>
			</View>
		</PickerContext.Provider>
	);
};

const PickerItem = memo(
	({
		item,
		isNationality,
		showDialCode,
	}: {
		item: CountryDataType;
		isNationality: boolean;
		showDialCode: boolean;
	}) => {
		const isDark = useIsDarkMode();
		const { onChange, sharedValue } = useContext(PickerContext);

		const handleChange = useCallback(() => {
			onChange(item);
		}, [item, onChange]);

		const style = useAnimatedStyle(() => {
			return {
				opacity: sharedValue.value === item.code ? 1 : 0,
			};
		}, [sharedValue]);

		const extraInfo = [];
		if (isNationality) {
			extraInfo.push(item.name);
		}
		if (showDialCode) {
			extraInfo.push(item.dial_code);
		}

		return (
			<PressableScale onPress={handleChange}>
				<View tw="flex-row items-center px-8 py-5 dark:bg-black">
					<Text tw="text-sm font-semibold dark:text-gray-100">
						{item.emoji}{' '}
						{isNationality ? item.nationality : item.name}
						{extraInfo.length > 0
							? ` (${extraInfo.join(' ')})`
							: ''}
					</Text>
					<Animated.View style={[style, { marginLeft: 'auto' }]}>
						<Check
							height={24}
							width={24}
							color={isDark ? '#FFF' : '#000'}
						/>
					</Animated.View>
				</View>
			</PressableScale>
		);
	}
);

PickerItem.displayName = 'PickerItem';
