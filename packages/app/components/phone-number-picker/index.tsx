import { LoginInputField } from '../login/login-input-field';
import { yup } from '@diversifiedfinance/app/lib/yup';
import { Button } from '@diversifiedfinance/design-system/button';
import { CountryCodePicker } from '@diversifiedfinance/design-system/country-code-picker';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ChevronLeft from '@diversifiedfinance/design-system/icon/ChevronLeft';
import Close from '@diversifiedfinance/design-system/icon/Close';
import Search from '@diversifiedfinance/design-system/icon/Search';
import { Input } from '@diversifiedfinance/design-system/input';
import { PressableScale } from '@diversifiedfinance/design-system/pressable-scale';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from '@diversifiedfinance/design-system/safe-area';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import * as Localization from 'expo-localization';
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Modal, Platform, TextInput } from 'react-native';
import getPhoneData from './phone-data';
import { useTranslation } from 'react-i18next';
import { defaultCountryCode } from '@diversifiedfinance/app/lib/constants';
import { CountryDataType } from '@diversifiedfinance/design-system/country-code-picker/country-code-data';

type PhoneNumberPickerProp = {
	phone: string;
	handleSubmitPhoneNumber: any;
	isSignup?: boolean;
	bottomElement?: ReactNode;
};

function findCountryFromPhoneNumber(
	phoneNumber: string,
	phoneData: Array<CountryDataType>
) {
	const MAX_PREFIX_LENGTH = 5;
	const MIN_PREFIX_LENGTH = 2;
	for (
		let i = Math.min(phoneNumber.length, MAX_PREFIX_LENGTH);
		i >= MIN_PREFIX_LENGTH;
		i--
	) {
		const prefix = phoneNumber.substring(0, i);
		const countryMatch = phoneData.find(
			(item: CountryDataType) => item.dial_code === prefix
		);
		if (countryMatch) {
			return countryMatch;
		}
	}
	return undefined;
}

export const PhoneNumberPicker = (props: PhoneNumberPickerProp) => {
	const { t } = useTranslation();
	const [modalVisible, setModalVisible] = useState(false);
	const [search, setSearch] = useState('');
	const phoneData = useMemo(() => getPhoneData(t), [t]);

	const initialCountry = props.phone
		? findCountryFromPhoneNumber(props.phone, phoneData)
		: phoneData.find((item) => item.code === Localization.region);
	const localPhoneNumber = props.phone?.replace(
		initialCountry?.dial_code || '',
		''
	);
	const [country, setCountry] = useState(
		() => initialCountry?.code || defaultCountryCode
	);

	const selectedCountry = useMemo(() => {
		return phoneData.find((item) => item.code === country);
	}, [country, t]);

	const phoneNumberValidationSchema = useMemo(
		() =>
			yup
				.object({
					data: yup
						.number()
						.required(t('Please enter a valid phone number.'))
						.typeError(t('Please enter a valid phone number.')),
				})
				.required(),
		[t]
	);

	const filteredData = useMemo(() => {
		return search
			? phoneData.filter((item) => {
					return (
						item.name
							.toLowerCase()
							.includes(search.toLowerCase()) ||
						item.dial_code.includes(search)
					);
			  })
			: phoneData;
	}, [search, t]);

	const leftElement = useMemo(() => {
		return (
			<PressableScale
				onPress={() => {
					setSearch('');
					setModalVisible(true);
				}}
				hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				style={{
					height: 20,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Text
					style={{
						marginTop: Platform.select({
							android: -3,
							default: 0,
							web: 2,
						}),
						fontSize: Platform.select({
							default: 18,
							android: 16,
							web: 20,
						}),
					}}
				>
					{selectedCountry?.emoji}
				</Text>
				<Text tw="text-base font-semibold text-gray-600 dark:text-gray-400">
					{selectedCountry?.dial_code}{' '}
				</Text>
			</PressableScale>
		);
	}, [selectedCountry]);

	const onSubmit = useCallback(
		(phoneNumber: string) =>
			props.handleSubmitPhoneNumber(
				`${selectedCountry?.dial_code}${phoneNumber}`
			),
		[props, selectedCountry]
	);

	const textInputRef = useRef<TextInput>(null);

	const handleModalHide = useCallback(() => {
		setModalVisible(false);

		// reset focus to phone input on country picker close
		textInputRef.current?.focus();
	}, []);

	const handleCountrySelect = useCallback(
		(value: any) => {
			setCountry(value);
			handleModalHide();
		},
		[handleModalHide]
	);

	return (
		<>
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
								title={t('Select country')}
								close={handleModalHide}
								onSearchSubmit={(value) => setSearch(value)}
								twCenter="max-w-screen-sm"
							/>
						</View>
					</SafeAreaView>
					<CountryCodePicker
						data={filteredData}
						value={country}
						onChange={handleCountrySelect}
						tw="mx-auto w-full max-w-screen-sm"
					/>
				</View>
			</Modal>

			<LoginInputField
				defaultValue={localPhoneNumber || ''}
				key="login-phone-number-field"
				validationSchema={phoneNumberValidationSchema}
				label={t('Phone number')}
				placeholder={t('Enter your phone number')}
				inputMode="tel"
				textInputRef={textInputRef}
				signInButtonLabel={t('Continue with Phone')}
				leftElement={leftElement}
				onSubmit={onSubmit}
				bottomElement={props.bottomElement}
				autoComplete="tel"
			/>
		</>
	);
};

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
