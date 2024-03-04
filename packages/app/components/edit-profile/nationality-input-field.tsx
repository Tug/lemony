import {
	CountryCodePicker,
	Pressable,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import { Button } from '@diversifiedfinance/design-system/button';
import { getCountryList } from '@diversifiedfinance/design-system/country-code-picker/country-code-data';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ChevronDown from '@diversifiedfinance/design-system/icon/ChevronDown';
import ChevronLeft from '@diversifiedfinance/design-system/icon/ChevronLeft';
import Close from '@diversifiedfinance/design-system/icon/Close';
import Search from '@diversifiedfinance/design-system/icon/Search';
import { Input } from '@diversifiedfinance/design-system/input';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from '@diversifiedfinance/design-system/safe-area';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import React, {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Controller, ControllerRenderProps, Control } from 'react-hook-form';
import { Modal, Platform, TextInput } from 'react-native';
import i18n, { getLang } from '@diversifiedfinance/app/lib/i18n';
import { useTranslation } from 'react-i18next';
import { cleanUpSpecialChars } from '@diversifiedfinance/app/lib/i18n/utils';

interface NationalityInputFieldProps {
	label: string;
	name: string;
	placeholder?: string;
	control: Control<any, any>;
	onChange?: (newValue?: string) => void;
	errorText?: string;
}

export function NationalityInputField({
	name,
	label,
	placeholder = '',
	control,
	onChange,
	errorText,
}: NationalityInputFieldProps) {
	return (
		<>
			<Controller
				control={control}
				name={name}
				render={({ field }) => (
					<ControlledNationalityInputField
						label={label}
						placeholder={placeholder}
						onChange={onChange}
						field={field}
					/>
				)}
			/>
		</>
	);
}

export const ControlledNationalityInputField = memo(
	({
		label,
		placeholder,
		onChange,
		field: { onChange: onValueChange, value },
	}: {
		label: string;
		placeholder?: string;
		onChange?: (newValue?: string) => void;
		field: ControllerRenderProps;
	}) => {
		const [modalVisible, setModalVisible] = useState(false);
		const [search, setSearch] = useState('');
		const isDark = useIsDarkMode();
		const { t } = useTranslation();
		const data = useMemo(() => getCountryList(t), [t]);

		const filteredData = useMemo(() => {
			return search
				? data.filter((item) => {
						const lcSearch =
							cleanUpSpecialChars(search).toLowerCase();
						return (
							cleanUpSpecialChars(item.name)
								.toLowerCase()
								.includes(lcSearch) ||
							item.nationality.toLowerCase().includes(lcSearch)
						);
				  })
				: data;
		}, [search]);

		const handleModalHide = useCallback(() => {
			setModalVisible(false);
		}, [setModalVisible]);

		const selectedCountry = useMemo(() => {
			return data.find((item) => item.code === value);
		}, [value]);

		const nationality =
			getLang() === 'en'
				? selectedCountry?.nationality
				: selectedCountry?.name;

		return (
			<View>
				<Pressable
					onPress={() => {
						setSearch('');
						setModalVisible(true);
					}}
				>
					<Text tw="font-bold text-gray-900 dark:text-white">
						{label}
					</Text>
					<View tw="mt-3 h-12 flex-row items-center justify-between rounded-full bg-gray-100 p-4 dark:bg-gray-900">
						{nationality && (
							<Text tw="text-base text-gray-900 dark:text-white">
								{nationality}
							</Text>
						)}
						{!selectedCountry && (
							<Text tw="text-base text-gray-600 dark:text-gray-400">
								{placeholder}
							</Text>
						)}
						<ChevronDown
							width={16}
							height={16}
							color={isDark ? '#FFF' : '#000'}
						/>
					</View>
				</Pressable>

				<View tw="t-0 l-0 w-full flex-row">
					<Modal
						visible={modalVisible}
						onRequestClose={handleModalHide}
						animationType="slide"
						transparent={Platform.OS === 'web'}
						statusBarTranslucent={Platform.OS === 'web'}
					>
						<View tw="min-h-screen bg-white dark:bg-black">
							<SafeAreaView>
								<View tw="mx-auto w-full max-w-screen-md">
									<Header
										title={placeholder}
										close={handleModalHide}
										onSearchSubmit={setSearch}
										twCenter="max-w-screen-sm"
									/>
								</View>
							</SafeAreaView>
							<CountryCodePicker
								isNationality={i18n.language === 'en'}
								showDialCode={false}
								data={filteredData}
								value={selectedCountry?.code}
								onChange={(countryCode) => {
									onValueChange(countryCode);
									onChange?.(countryCode);
									handleModalHide();
								}}
								tw="mx-auto w-full max-w-screen-sm"
							/>
						</View>
					</Modal>
				</View>
			</View>
		);
	},
	(prevProps, nextProps) => prevProps.field.value === nextProps.field.value
);

type Props = {
	title?: string;
	close?: () => void;
	onSearchSubmit: (search: string) => void;
	twCenter?: string;
};

export function Header({ title, close, onSearchSubmit, twCenter = '' }: Props) {
	const isDark = useIsDarkMode();
	const [showSearch, setShowSearch] = useState(true);
	const searchDebounceTimeout = useRef<any>(null);

	const { top: safeAreaTop } = useSafeAreaInsets();

	const handleSearch = (text: string) => {
		if (searchDebounceTimeout.current) {
			clearTimeout(searchDebounceTimeout.current);
		}
		searchDebounceTimeout.current = setTimeout(() => {
			onSearchSubmit(text);
		}, 40);
	};
	const onPressTitle = () => {
		setShowSearch(true);
	};
	useEffect(() => {
		if (!showSearch) {
			onSearchSubmit('');
		}
	}, [showSearch, onSearchSubmit]);

	return (
		<View
			style={{
				marginTop: safeAreaTop,
			}}
			tw="w-full flex-row items-center justify-between bg-white px-4 py-2 dark:bg-black"
		>
			<View tw="h-12 w-12 items-center justify-center">
				<Button
					onPress={close}
					variant="tertiary"
					size="regular"
					iconOnly
					tw="bg-white px-3 dark:bg-gray-900"
				>
					<ChevronLeft
						width={24}
						height={24}
						color={isDark ? '#FFF' : '#000'}
					/>
				</Button>
			</View>

			<View tw={['mx-2 my-2 flex-1', twCenter]}>
				{showSearch ? (
					<Input
						placeholder="Search"
						autoFocus
						onChangeText={handleSearch}
					/>
				) : (
					<Text
						onPress={onPressTitle}
						tw="font-poppins-semibold px-4 py-3.5 text-lg font-bold dark:text-white"
					>
						{title}
					</Text>
				)}
			</View>
			<View tw="h-12 w-12 items-center justify-center">
				<Button
					onPress={() => setShowSearch(!showSearch)}
					variant="tertiary"
					size="regular"
					iconOnly
					tw="bg-white px-3 dark:bg-gray-900"
				>
					{showSearch ? (
						<Close
							width={24}
							height={24}
							color={isDark ? '#FFF' : '#000'}
						/>
					) : (
						<Search
							width={24}
							height={24}
							color={isDark ? '#FFF' : '#000'}
						/>
					)}
				</Button>
			</View>
		</View>
	);
}
