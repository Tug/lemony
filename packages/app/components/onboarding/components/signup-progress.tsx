import { Text, View } from '@diversifiedfinance/design-system';
import React, { useEffect } from 'react';
import { CircularProgress } from '@diversifiedfinance/components/circular-progress';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export interface SignupProgressProps {
	stepNumber?: number;
	stepCount?: number;
	stepName?: string;
}
export default function SignupProgress({
	stepNumber,
	stepCount,
	stepName,
}: SignupProgressProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const strokeColor = isDark ? colors.themeYellow : colors.themeNight;
	const percentProgress =
		stepNumber && stepCount && stepCount > 0
			? (stepNumber - 1) / stepCount
			: 0;
	const percentProgressString = `${Math.round(percentProgress * 100)}%`;

	if (!stepName) {
		return null;
	}

	return (
		<View tw="ml-2">
			<View tw="mx-auto flex-row items-center">
				<View tw="mr-4 items-end text-right">
					<View tw="my-1">
						<Text tw="text-sm dark:text-white">
							{t('Step {{stepNumber}}/{{stepCount}}', {
								stepNumber,
								stepCount,
							})}
						</Text>
					</View>
					<View tw="my-1">
						<Text tw="text-sm font-semibold dark:text-white">
							{stepName}
						</Text>
					</View>
				</View>
				<View>
					<CircularProgress
						size={52}
						strokeColor={strokeColor}
						strokeBgColor="transparent"
						strokeWidth={6}
						progress={percentProgress}
						strokeLinecap="round"
					>
						<Text tw="text-sm dark:text-white">
							{percentProgressString}
						</Text>
					</CircularProgress>
				</View>
			</View>
		</View>
	);
}
