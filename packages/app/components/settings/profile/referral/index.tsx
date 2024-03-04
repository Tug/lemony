import { useUser } from '../../../../hooks/use-user';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { useTranslation } from 'react-i18next';
import { Button } from '@diversifiedfinance/design-system';
import { useMyReferralInfo } from '@diversifiedfinance/app/hooks/api-hooks';
import { Platform } from 'react-native';
import { useNavigateToModalScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

type ReferralProps = {};

export const Referral = ({}: ReferralProps) => {
	const { t } = useTranslation();
	const { user } = useUser();
	const { data: myReferralInfo } = useMyReferralInfo();
	const profileData = user?.data?.profile;
	const openModal = useNavigateToModalScreen();
	const handleEditProfile = () => {
		openModal('editProfile', {
			fields: 'sponsorReferralCode',
		});
	};

	return (
		<View tw={Platform.select({ web: 'p-4 mt-8' })}>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Referrer')}
					</Text>
				</View>
				<View>
					<Text
						tw={[
							'text-base text-gray-900 dark:text-white',
							!profileData?.hasSponsor
								? 'text-gray-500 dark:text-gray-500'
								: '',
						]}
					>
						{profileData?.hasSponsor ? t('Valid') : t('None')}
					</Text>
				</View>
			</View>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Number of successful referrals')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{myReferralInfo?.referralCount ?? 0}
					</Text>
				</View>
			</View>
			<View tw="my-8 flex-row justify-between">
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{t('Number of referrals turned customers')}
					</Text>
				</View>
				<View>
					<Text tw="text-base text-gray-900 dark:text-white">
						{myReferralInfo?.referralTurnedCustomerCount ?? 0}
					</Text>
				</View>
			</View>
			<View tw="my-8">
				{!profileData?.hasSponsor && (
					<Button
						variant="primary"
						size="regular"
						onPress={handleEditProfile}
					>
						{t('Enter referral code')}
					</Button>
				)}
			</View>
		</View>
	);
};
