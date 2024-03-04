import Avatar from '../../avatar';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { Text, View } from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ChevronRight from '@diversifiedfinance/design-system/icon/ChevronRight';
import UserCircle from '@diversifiedfinance/design-system/icon/UserCircle';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import KycStatus from '@diversifiedfinance/app/components/kyc-status';
import React from 'react';
import { useFeature } from '@growthbook/growthbook-react';
import { useKycSync } from '@diversifiedfinance/app/hooks/use-kyc-sync';
import { useVIPUserLevel } from '@diversifiedfinance/app/hooks/use-vip-user-level';
import { useBankAccounts } from '@diversifiedfinance/app/hooks/api-hooks';
import { PresaleBadge } from '@diversifiedfinance/app/components/presale-badge';

const ProfileRow = () => {
	useKycSync();
	const isDark = useIsDarkMode();
	const { user } = useUser();
	const profileData = user?.data.profile;
	const noAvatarSupport = useFeature('avatar-support').off;
	const { isVIP, currentLevelLabel, currentLevelColor } = useVIPUserLevel();
	const { data: bankAccounts, isLoading: isBankAccountLoading } =
		useBankAccounts(false);
	const hasBankAccount = bankAccounts && bankAccounts.length > 0;
	const isPresaleWhitelisted = !isBankAccountLoading && hasBankAccount;

	return (
		<View tw="mx-4 mt-2 mb-4 flex-row items-stretch justify-start">
			<View>
				{!noAvatarSupport ? (
					<Avatar size={64} />
				) : (
					<UserCircle
						width={64}
						height={64}
						color={isDark ? 'white' : 'black'}
					/>
				)}
			</View>
			<View tw="shrink grow flex-col items-start justify-items-start">
				<View tw="px-2 mb-1 mt-2">
					<Text
						numberOfLines={1}
						tw="max-w-full truncate text-ellipsis text-xl font-semibold text-gray-900 dark:text-white"
					>
						{profileData?.name}
					</Text>
				</View>
				<View tw="my-1 px-2 flex-row items-center flex-wrap ">
					<KycStatus />
					{isVIP && (
						<View
							tw={[
								'items-center justify-center rounded-full justify-center py-1.5 px-2 mr-1 mt-1',
								currentLevelColor === colors.black
									? 'border border-white'
									: '',
							]}
							style={{ backgroundColor: currentLevelColor }}
						>
							<Text tw="text-xs font-medium text-white">
								{currentLevelLabel.toUpperCase()}
							</Text>
						</View>
					)}
					{isPresaleWhitelisted && (
						<PresaleBadge tw="border border-green-500 dark:border-green-700 h-[21px] mt-1" />
					)}
				</View>
			</View>
			<View tw="w-8 items-center justify-center">
				<ChevronRight
					width={24}
					height={24}
					color={isDark ? colors.gray[200] : colors.gray[700]}
				/>
			</View>
		</View>
	);
};

export default ProfileRow;
