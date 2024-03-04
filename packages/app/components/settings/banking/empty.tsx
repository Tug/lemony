import { useTranslation } from 'react-i18next';
import { Spinner, Text, View } from '@diversifiedfinance/design-system';
import React from 'react';

export const NoBankAccounts = ({ isLoading }: { isLoading: boolean }) => {
	const { t } = useTranslation();
	return (
		<View tw="">
			<View tw="m-4 items-center">
				{isLoading ? (
					<Spinner />
				) : (
					<Text tw="text-black dark:text-white">
						{t('No bank accounts registered')}
					</Text>
				)}
			</View>
		</View>
	);
};
