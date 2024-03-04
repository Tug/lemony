import Sumsub from '@diversifiedfinance/app/lib/sumsub';
import { View, Text } from '@diversifiedfinance/design-system';
import React, { useCallback } from 'react';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useKycSync } from '@diversifiedfinance/app/hooks/use-kyc-sync';

type KYCSettingsProps = {};

export const KYCSettings = ({}: KYCSettingsProps) => {
	const router = useRouter();
	const kycSync = useKycSync(false);
	const onDone = useCallback(() => {
		kycSync();
		router.pop();
	}, [kycSync, router]);

	return (
		<View tw="w-full max-w-screen-md flex-1">
			<View tw="mt-16 bg-white dark:bg-black">
				<Sumsub opened={true} onClose={onDone} />
			</View>
		</View>
	);
};

export default KYCSettings;
