import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';

import {
	Route,
	TabBarVertical,
} from '@diversifiedfinance/design-system/tab-view';

import { BankAccountSettings } from './bank-account';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useTranslation } from 'react-i18next';
import { Button, Spinner } from '@diversifiedfinance/design-system';
import React from 'react';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { NoBankAccounts } from '@diversifiedfinance/app/components/settings/banking/empty';

//const LEFT_SLIDE_WIDTH = 264;
export const SettingsMd = ({
	isLoading,
	currentRouteIndex = 0,
	routes,
}: {
	isLoading: boolean;
	currentRouteIndex: number;
	routes: Route[];
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const bottomHeight = usePlatformBottomHeight();
	const redirectTo = useNavigateToScreen();

	return (
		<View tw="h-screen w-full flex-1 bg-white dark:bg-black">
			<View tw="h-screen w-full flex-row">
				<View tw="w-72 border-l border-r border-gray-200 dark:border-gray-800">
					<View tw="bg-white pt-6 dark:bg-black">
						<View tw="flex-row items-center">
							<Text tw="px-4 text-xl font-bold text-gray-900 dark:text-white">
								{t('Your Bank Accounts')}
							</Text>
							<Button
								variant="primary"
								onPress={() =>
									redirectTo('addBankAccount', undefined, {
										addBankAccountModal: true,
									})
								}
							>
								{t('Add')}
							</Button>
						</View>
						{routes.length > 0 && (
							<TabBarVertical
								onPress={(i) => {
									if (routes[i].onPress) {
										routes[i].onPress();
									} else if (routes[i].href) {
										router.push(routes[i].href);
									}
								}}
								routes={routes}
								index={currentRouteIndex}
								tw="px-2"
							/>
						)}
					</View>
				</View>

				<View tw="w-full flex-1 overflow-hidden overflow-y-auto bg-white dark:bg-black">
					<View>
						{routes.length === 0 ? (
							<NoBankAccounts isLoading={isLoading} />
						) : (
							<BankAccountSettings
								bankAccountId={
									routes[currentRouteIndex].bankAccountId
								}
							/>
						)}
					</View>
				</View>
			</View>

			<View style={{ height: bottomHeight }} />
		</View>
	);
};
