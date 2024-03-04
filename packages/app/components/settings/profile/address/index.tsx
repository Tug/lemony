import { useUser } from '../../../../hooks/use-user';
import { getCountry } from '../../../../utilities';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Spinner } from '@diversifiedfinance/design-system';
import { useNavigateToModalScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

type AddressProps = {};

export const Address = ({}: AddressProps) => {
	const { t } = useTranslation();
	const { user, isLoading } = useUser();
	const address = user?.data.profile.address;
	const openModal = useNavigateToModalScreen();

	if (isLoading) {
		return <Spinner />;
	}

	if (!address?.addressLine1 && !address?.city && !address?.postalCode) {
		return (
			<View tw={Platform.select({ web: 'p-4 mt-8' })}>
				<View tw="my-8">
					<Text tw="text-base text-black dark:text-white">
						{t(
							'Your residential address is required to transfer your Euros out of the Diversified platform'
						)}
					</Text>
				</View>
				<View tw="my-8">
					<Button
						variant="primary"
						size="regular"
						onPress={() => openModal('editAddress')}
					>
						{t('Enter your address')}
					</Button>
				</View>
			</View>
		);
	}

	return (
		<View tw={Platform.select({ web: 'p-4 mt-8' })}>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Address')}
					</Text>
				</View>
				<View tw="gap-y-2">
					<Text tw="text-base text-gray-900 dark:text-white">
						{address?.addressLine1 ?? 'N/A'}
					</Text>
					{address?.addressLine2 && (
						<Text tw="text-base text-gray-900 dark:text-white">
							{address?.addressLine2 ?? 'N/A'}
						</Text>
					)}
				</View>
			</View>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('City')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{address?.city ?? 'N/A'}
					</Text>
				</View>
			</View>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Postal Code')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{address?.postalCode ?? 'N/A'}
					</Text>
				</View>
			</View>
			{address?.region && (
				<View tw="my-8 flex-row justify-between">
					<View>
						<Text tw="text-base text-gray-900 dark:text-white">
							{t('Region')}
						</Text>
					</View>
					<View>
						<Text tw="text-base text-gray-900 dark:text-white">
							{address?.region ?? 'N/A'}
						</Text>
					</View>
				</View>
			)}
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Country')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{getCountry(address?.country.code)?.name ?? 'N/A'}
					</Text>
				</View>
			</View>
			<View tw="my-8">
				<Button
					variant="primary"
					size="regular"
					onPress={() => openModal('editAddress')}
				>
					{t('Edit')}
				</Button>
			</View>
		</View>
	);
};
