import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { Skeleton } from '@diversifiedfinance/design-system';
import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';
import { Separator } from './separator';
import { IbanInformationProps } from '@diversifiedfinance/app/components/payment/iban-information/index';

export function IbanInformationSkeleton({
	showBalance,
	showName,
}: IbanInformationProps) {
	return (
		<View>
			{showBalance && (
				<>
					<View tw="my-3 flex-row justify-between">
						<View>
							<Skeleton width={100} height={20} show />
						</View>
						<View>
							<Skeleton width={80} height={20} show />
						</View>
					</View>
					<Separator />
				</>
			)}
			{showName && (
				<>
					<View tw="my-3 flex-row justify-between">
						<View>
							<Skeleton width={80} height={20} show />
						</View>
						<View>
							<Skeleton width={100} height={20} show />
						</View>
					</View>
					<Separator />
				</>
			)}
			<View tw="my-3 flex-row justify-between">
				<View>
					<Skeleton width={50} height={20} show />
				</View>
				<View>
					<Skeleton width={220} height={20} show />
				</View>
			</View>
		</View>
	);
}
