import { useUser } from '../../../../hooks/use-user';
import { getCountry, getNationality } from '../../../../utilities';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '@diversifiedfinance/app/lib/i18n';
import { Button } from '@diversifiedfinance/design-system';
import { useNavigateToModalScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

type PersonalInformationProps = {};

export const PersonalInformation = ({}: PersonalInformationProps) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { user } = useUser();
	const profileData = user?.data?.profile;
	const openModal = useNavigateToModalScreen();

	return (
		<View tw={Platform.select({ web: 'p-4 mt-8' })}>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('First Name')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{profileData?.firstName ?? 'N/A'}
					</Text>
				</View>
			</View>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Last Name')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{profileData?.lastName ?? 'N/A'}
					</Text>
				</View>
			</View>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Birth Date')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{profileData?.birthDate
							? new Intl.DateTimeFormat(i18n.language).format(
									new Date(profileData?.birthDate)
							  )
							: 'N/A'}
					</Text>
				</View>
			</View>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Nationality')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{getNationality(profileData?.nationality?.code) ??
							'N/A'}
					</Text>
				</View>
			</View>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Country of Residence')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{getCountry(profileData?.countryOfResidence?.code)
							?.name ?? 'N/A'}
					</Text>
				</View>
			</View>
			<View tw="my-8">
				<Button
					variant="primary"
					size="regular"
					onPress={() => openModal('editProfile')}
				>
					{t('Edit')}
				</Button>
			</View>
		</View>
	);
};
