import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { KYCStatus } from '@diversifiedfinance/types/diversified';
import { useTranslation } from 'react-i18next';

export const kycStatusColors: {
	[status in KYCStatus]?: string;
} = {
	init: '#98A2B3',
	pending: '#98A2B3',
	queued: '#98A2B3',
	onHold: '#FFA844',
	completed: '#12B76A',
};

export default function KycStatus({
	small = false,
	tw,
}: {
	small: boolean;
	tw?: string;
}) {
	const { t } = useTranslation();
	const { user } = useUser();

	const kycStatus = user?.data.profile.kycStatus ?? 'init';
	const kycStatusColor: string | undefined = kycStatusColors[kycStatus];

	const kycStatusMessages: {
		[status in KYCStatus]?: string;
	} = {
		init: t('Unverified'),
		pending: t('In progress'),
		queued: t('In progress'),
		onHold: t('Awaiting Verification'),
		completed: t('Verified'),
	};

	if (!kycStatusMessages[kycStatus]) {
		return null;
	}

	return (
		<View
			tw={[
				'dark:bg-primary-500 rounded-full justify-center px-2 mt-1 mr-1',
				small ? 'py-1' : 'py-1.5',
				tw ?? '',
			]}
			style={{
				backgroundColor: kycStatusColor,
			}}
		>
			<Text tw="text-xs font-medium text-white dark:text-gray-900">
				{kycStatusMessages[kycStatus]?.toUpperCase()}
			</Text>
		</View>
	);
}
